"use strict";
const http = require("node:http");
const crypto = require("node:crypto");
const { createClient } = require("redis");
const { required, port } = require("../scripts/runtime-config.cjs");
const { grpc, DomainError, fail, identity, bearer, invoke, closeClients } = require("../scripts/rpc-security.cjs");
const routing = require("./identity-routes.cjs");
const { health } = require("./health.cjs");
const redis = createClient({
    socket: { host: required("REDIS_HOST"), port: port("REDIS_PORT", 6379), connectTimeout: 2000, reconnectStrategy: () => 1000 },
    password: required("REDIS_PASSWORD"),
    database: Number(process.env.REDIS_DATABASE || 0),
});
redis.on("error", () => {}); // Drivers may contain endpoint details; never dump configuration.
void redis.connect().catch(() => {});
const limited = {
    loginAccount: ["login", "RATE_LIMIT_LOGIN_MAX_PER_IP", 10],
    requestDriverOtp: ["otp-request", "RATE_LIMIT_OTP_REQUEST_MAX_PER_IP", 5],
    verifyDriverOtp: ["otp-verify", "RATE_LIMIT_OTP_VERIFY_MAX_PER_IP", 10],
    bookingAccount: ["booking-account", "RATE_LIMIT_BOOKING_MAX_PER_ACCOUNT", 10],
    bookingIp: ["booking-ip", "RATE_LIMIT_BOOKING_MAX_PER_IP", 120],
};
const counters =
    "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],ARGV[1]) end; local ttl=redis.call('TTL',KEYS[1]); if ttl<1 then redis.call('EXPIRE',KEYS[1],ARGV[1]);ttl=tonumber(ARGV[1]) end; return {n,ttl}";
async function limit(operation, ip, account) {
    if (operation === "createBooking") {
        await limit("bookingAccount", account);
        await limit("bookingIp", ip);
        return;
    }
    const policy = limited[operation];
    if (!policy) return;
    if (!redis.isReady) fail(grpc.status.UNAVAILABLE, "DEPENDENCY_UNAVAILABLE", "Rate limiter is unavailable.");
    const window = Number(process.env.RATE_LIMIT_WINDOW_SECONDS || 60);
    const maximum = Number(process.env[policy[1]] || policy[2]);
    if (window !== 60 || !Number.isInteger(maximum) || maximum < 1) {
        fail(grpc.status.UNAVAILABLE, "DEPENDENCY_UNAVAILABLE", "Rate limiter configuration is invalid.");
    }
    let result;
    try {
        result = await Promise.race([
            redis.eval(counters, { keys: ["cab:rate:" + policy[0] + ":" + crypto.createHash("sha256").update(ip).digest("hex")], arguments: [String(window)] }),
            new Promise((_, reject) => {
                const timer = setTimeout(() => reject(new Error("Redis deadline")), 2000);
                timer.unref();
            }),
        ]);
    } catch {
        fail(grpc.status.UNAVAILABLE, "DEPENDENCY_UNAVAILABLE", "Rate limiter is unavailable.");
    }
    if (Number(result[0]) > maximum) fail(grpc.status.RESOURCE_EXHAUSTED, "RATE_LIMITED", "Request limit exceeded.", Math.max(1, Number(result[1])));
}
const statuses = new Map([
    [grpc.status.INVALID_ARGUMENT, 400],
    [grpc.status.UNAUTHENTICATED, 401],
    [grpc.status.PERMISSION_DENIED, 403],
    [grpc.status.NOT_FOUND, 404],
    [grpc.status.ALREADY_EXISTS, 409],
    [grpc.status.ABORTED, 409],
    [grpc.status.FAILED_PRECONDITION, 409],
    [grpc.status.RESOURCE_EXHAUSTED, 429],
    [grpc.status.UNAVAILABLE, 503],
    [grpc.status.DEADLINE_EXCEEDED, 504],
]);
function send(response, status, body, requestId, headers = {}) {
    response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "X-Request-Id": requestId, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store", ...headers });
    response.end(JSON.stringify(body));
}
async function readBody(request, rawOnly = false) {
    const chunks = [];
    let size = 0;
    for await (const chunk of request) {
        size += chunk.length;
        if (size > 65536) fail(grpc.status.INVALID_ARGUMENT, "INVALID_INPUT", "Request body is too large.");
        chunks.push(chunk);
    }
    if (!size) return { body: undefined, raw: Buffer.alloc(0) };
    if (!(request.headers["content-type"] || "").toLowerCase().startsWith("application/json")) {
        fail(grpc.status.INVALID_ARGUMENT, "INVALID_INPUT", "Content-Type must be application/json.");
    }
    const raw = Buffer.concat(chunks);
    if (rawOnly) return { body: undefined, raw };
    try {
        return { body: JSON.parse(raw.toString("utf8")), raw };
    } catch {
        fail(grpc.status.INVALID_ARGUMENT, "INVALID_INPUT", "Request body is not valid JSON.");
    }
}
const server = http.createServer(async (request, response) => {
    const requestId = crypto.randomUUID();
    try {
        const url = new URL(request.url, "http://gateway.local");
        let route;
        try {
            route = routing.match(request.method, url.pathname);
        } catch {
            fail(grpc.status.INVALID_ARGUMENT, "INVALID_INPUT", "Invalid request path.");
        }
        if (!route) {
            request.resume();
            fail(grpc.status.NOT_FOUND, "NOT_FOUND", "Endpoint does not exist.");
        }
        if (route.operation.startsWith("gateway")) {
            request.resume();
            const result = await health(route.operation, redis);
            send(response, result.status, result.body, requestId);
            return;
        }
        let token, claims;
        if (!route.public) {
            token = bearer(request.headers.authorization);
            claims = identity(token);
            if (route.roles.length && !route.roles.includes(claims.role)) {
                fail(grpc.status.PERMISSION_DENIED, "FORBIDDEN", "Role is not permitted.");
            }
        }
        await limit(route.operation, request.socket.remoteAddress || "unknown", claims?.sub);
        if (route.operation === "handleMockCallback") {
            if (typeof request.headers["x-mock-signature"] !== "string" || !/^sha256=[0-9a-f]{64}$/.test(request.headers["x-mock-signature"]))
                fail(grpc.status.UNAUTHENTICATED, "INVALID_CALLBACK_SIGNATURE", "Invalid callback signature.");
            if (!/^[0-9]{1,10}$/.test(request.headers["x-mock-timestamp"] || "")) fail(grpc.status.INVALID_ARGUMENT, "INVALID_CALLBACK_DATA", "Invalid callback timestamp.");
        }
        const { body: parsed, raw } = await readBody(request, route.operation === "handleMockCallback");
        const body = route.operation === "handleMockCallback" ? parsed : routing.normalizeBody(parsed);
        const query = route.operation === "handleMockCallback" ? {} : routing.validate(route, url, body, request.headers);
        if (route.operation === "registerAccount" && Object.hasOwn(body, "plateNumber")) {
            await limit(Object.hasOwn(body, "code") ? "verifyDriverOtp" : "requestDriverOtp", request.socket.remoteAddress || "unknown");
        }
        if (route.operation === "handleMockCallback" && url.search) fail(grpc.status.INVALID_ARGUMENT, "INVALID_INPUT", "Unexpected query parameters.");
        const input = routing.input(route, body, query, request.headers, raw);
        const { result: output, metadata } = await invoke(route.service, route.rpc, input, { caller: "gateway", token, correlationId: requestId, withMetadata: true });
        const result = routing.output(output);
        const idempotent = ["createBooking", "createPayment", "retryPayment"].includes(route.operation);
        const status =
            route.operation === "registerAccount" && metadata?.get("cab-registration-otp")[0] === "true"
                ? 202
                : idempotent
                  ? metadata?.get("cab-created")[0] === "true"
                      ? 201
                      : 200
                  : [...route.responses.keys()].sort((a, b) => a - b)[0];
        if (!status || !route.responses.get(status)(result)) {
            fail(grpc.status.INTERNAL, "INTERNAL_ERROR", "Service response does not match the API contract.");
        }
        send(response, status, result, requestId);
    } catch (error) {
        const status = statuses.get(error instanceof DomainError ? error.status : error.code) || 500;
        const meta = error.metadata;
        const codes = meta?.get("cab-error-code") || [];
        const code =
            error instanceof DomainError
                ? error.domainCode
                : codes.length === 1
                  ? String(codes[0])
                  : status === 503
                    ? "DEPENDENCY_UNAVAILABLE"
                    : status === 504
                      ? "DEADLINE_EXCEEDED"
                      : status === 401
                        ? "INVALID_TOKEN"
                        : "INTERNAL_ERROR";
        const retry = error.retryAfter || Number(meta?.get("retry-after")?.[0]);
        const message =
            error instanceof DomainError
                ? error.message
                : codes.length === 1 && status < 500
                  ? error.details
                  : status === 503
                    ? "A required dependency is unavailable."
                    : status === 504
                      ? "Request deadline exceeded."
                      : "An internal error occurred.";
        if (!response.headersSent && !response.destroyed) send(response, status, { code, message, requestId }, requestId, status === 429 && retry ? { "Retry-After": String(retry) } : {});
    }
});
server.requestTimeout = 10000;
server.headersTimeout = 10000;
server.listen(port("GATEWAY_PORT", 3000), process.env.GATEWAY_HOST || "0.0.0.0", () => console.log("Gateway REST routes registered from ten OpenAPI contracts."));
let closing = false;
async function shutdown() {
    if (closing) return;
    closing = true;
    await new Promise((resolve) => server.close(resolve));
    closeClients();
    if (redis.isOpen) await redis.quit().catch(() => redis.disconnect());
}
process.once("SIGTERM", () => {
    void shutdown();
});
process.once("SIGINT", () => {
    void shutdown();
});
