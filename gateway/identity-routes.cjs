"use strict";
const fs = require("node:fs");
const path = require("node:path");
const YAML = require("yaml");
const Ajv = require("ajv");
const formats = require("ajv-formats");
const { grpc, fail } = require("../scripts/rpc-security.cjs");
const ajv = new Ajv({ strict: false, allErrors: false, coerceTypes: false });
formats(ajv);
ajv.addFormat("password", true);
const routes = [];
// OpenAPI 3.0 uses boolean exclusive bounds; AJV's JSON Schema dialect uses numbers.
// Convert a copy in memory, preserving the public YAML and its boundary semantics.
function normalizeSchema(value) {
    if (Array.isArray(value)) return value.map(normalizeSchema);
    if (!value || typeof value !== "object") return value;
    const result = Object.fromEntries(Object.entries(value).map(([key, child]) => [key, normalizeSchema(child)]));
    for (const [exclusive, inclusive] of [
        ["exclusiveMinimum", "minimum"],
        ["exclusiveMaximum", "maximum"],
    ]) {
        if (typeof result[exclusive] !== "boolean") continue;
        if (result[exclusive]) {
            if (typeof result[inclusive] !== "number" || !Number.isFinite(result[inclusive])) {
                throw new Error("OpenAPI exclusive bound requires a numeric " + inclusive);
            }
            result[exclusive] = result[inclusive];
            delete result[inclusive];
        } else delete result[exclusive];
    }
    return result;
}
for (const filename of fs
    .readdirSync(path.join(__dirname, "../docs/api"))
    .filter((f) => /^\d\d-.*\.yaml$/.test(f))
    .sort()) {
    const document = YAML.parse(fs.readFileSync(path.join(__dirname, "../docs/api/" + filename), "utf8"));
    const key = "urn:cab:" + filename;
    ajv.addSchema({ components: normalizeSchema(document.components) }, key);
    for (const [route, operations] of Object.entries(document.paths)) {
        for (const [method, op] of Object.entries(operations)) {
            if (!["get", "post", "patch", "put", "delete"].includes(method)) continue;
            const names = [];
            const pieces = ((filename === "10-health.yaml" ? "" : "/api/v1") + route).split("/").map((piece) => {
                if (/^\{[^}]+\}$/.test(piece)) {
                    names.push(piece.slice(1, -1));
                    return "([^/]+)";
                }
                return piece.replace(/[.*+?^$()|[\]\\]/g, "\\$&");
            });
            const compile = (schema) => {
                if (!schema) return null;
                // Local $refs in an operation resolve against its owning OpenAPI document.
                function refs(value) {
                    if (Array.isArray(value)) return value.map(refs);
                    if (!value || typeof value !== "object") return value;
                    return Object.fromEntries(Object.entries(value).map(([name, child]) => [name, name === "$ref" && child.startsWith("#/") ? key + child : refs(child)]));
                }
                return ajv.compile(refs(normalizeSchema(schema)));
            };
            const responses = new Map();
            for (const [status, response] of Object.entries(op.responses)) {
                const schema = response.content?.["application/json"]?.schema;
                if (/^2[0-9][0-9]$/.test(status) && schema) responses.set(Number(status), compile(schema));
            }
            const rpc = op["x-grpc"]?.split("/") || [];
            routes.push({
                method: method.toUpperCase(),
                pattern: new RegExp("^" + pieces.join("/") + "$"),
                names,
                operation: op.operationId,
                service: rpc[0]?.split(".")[1],
                rpc: rpc[1] && rpc[1][0].toLowerCase() + rpc[1].slice(1),
                public: op.operationId === "handleMockCallback" || (op.security || document.security)?.length === 0,
                roles: op["x-allowed-roles"] || [],
                parameters: (op.parameters || []).map((parameter) => ({ ...parameter, validate: compile(parameter.schema) })),
                body: compile(op.requestBody?.content?.["application/json"]?.schema),
                responses,
            });
        }
    }
}
function match(method, pathname) {
    for (const route of [...routes].sort((a, b) => a.names.length - b.names.length)) {
        const matches = route.method === method && route.pattern.exec(pathname);
        if (matches) return { ...route, params: Object.fromEntries(route.names.map((name, index) => [name, decodeURIComponent(matches[index + 1])])) };
    }
}
function normalizeBody(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) return body;
    return Object.fromEntries(Object.entries(body).map(([key, value]) => [key, key !== "password" && typeof value === "string" ? value.trim() : value]));
}
function validate(route, url, body, headers = {}) {
    const bad = () => fail(grpc.status.INVALID_ARGUMENT, "INVALID_INPUT", "Request contains invalid fields or values.");
    const allowedQueries = route.parameters.filter((p) => p.in === "query").map((p) => p.name);
    for (const key of url.searchParams.keys()) {
        if (!allowedQueries.includes(key) || url.searchParams.getAll(key).length !== 1) bad();
    }
    const query = {};
    for (const parameter of route.parameters) {
        let value = parameter.in === "path" ? route.params[parameter.name] : parameter.in === "header" ? headers[parameter.name.toLowerCase()] : url.searchParams.get(parameter.name);
        if (value === null || value === undefined) {
            value = parameter.schema.default;
            if (value === undefined) {
                if (parameter.required) bad();
                continue;
            }
        }
        if (parameter.schema.type === "integer" && typeof value === "string") {
            if (!/^[0-9]+$/.test(value)) bad();
            value = Number(value);
        }
        if (parameter.schema.type === "number" && typeof value === "string") {
            if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(value)) bad();
            value = Number(value);
        }
        if (!parameter.validate(value)) bad();
        if (parameter.in === "query") query[parameter.name] = value;
    }
    if (route.body && !route.body(body)) bad();
    if (!route.body && body !== undefined) bad();
    return query;
}
const internalNames = {cid:'customer_id',did:'driver_id',aid:'account_id',bid:'booking_id',tid:'trip_id',pid:'payment_id',
    nid:'notification_id',rid:'review_id',vid:'vehicle_id',iid:'invitation_id',oid:'otp_id'};
const publicNames = {customerId:'cid',driverId:'did',accountId:'aid',bookingId:'bid',tripId:'tid',paymentId:'pid',
    notificationId:'nid',reviewId:'rid',vehicleId:'vid',invitationId:'iid',otpId:'oid',recipientAccountId:'aid',activeTripId:'tid'};
function snake(input) {
    if (!input || typeof input !== "object" || Array.isArray(input)) return input;
    return Object.fromEntries(Object.entries(input).map(([key, value]) => [internalNames[key] || key.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase()), snake(value)]));
}
function camel(input) {
    if (Array.isArray(input)) return input.map(camel);
    if (!input || typeof input !== "object") return input;
    return Object.fromEntries(
        Object.entries(input)
            .filter(([key]) => !key.startsWith("_"))
            .map(([key, value]) => [key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()), camel(value)]),
    );
}
function input(route, body, query, headers, raw) {
    const value = { ...snake(body || {}), ...snake(route.params), ...snake(query) };
    if (["updateMyCustomer", "updateMyDriver"].includes(route.operation) && Object.hasOwn(value, "name")) {
        value.full_name = value.name;
        delete value.name;
    }
    if (route.operation === "requestDriverOtp") value.purpose = "DRIVER_REGISTRATION";
    if (route.operation === "handleMockCallback") return { raw_body: raw, signature: headers["x-mock-signature"], timestamp: Number(headers["x-mock-timestamp"]) };
    if (["createBooking", "createPayment", "retryPayment"].includes(route.operation)) value.idempotency_key = headers["idempotency-key"];
    if (route.operation === "retryPayment") {
        value.failed_payment_id = value.payment_id;
        delete value.payment_id;
    }
    if (route.operation === "listNearbyDrivers" && (Object.hasOwn(value, "latitude") || Object.hasOwn(value, "longitude"))) {
        value.location = { latitude: value.latitude, longitude: value.longitude };
        delete value.latitude;
        delete value.longitude;
    }
    if (["listDrivers", "listNearbyDrivers", "listBookings", "listMyInvitations", "listTrips", "listPayments"].includes(route.operation)) {
        value.paging = { page: value.page, limit: value.limit };
        delete value.page;
        delete value.limit;
    }
    if (route.operation === "updateTripLocation" && (Object.hasOwn(value, "latitude") || Object.hasOwn(value, "longitude"))) {
        value.location = { latitude: value.latitude, longitude: value.longitude };
        delete value.latitude;
        delete value.longitude;
    }
    return value;
}
function output(value) {
    const result = camel(value);
    function complete(node) {
        if (!node || typeof node !== "object") return;
        if (Object.hasOwn(node, "fullName")) {
            node.name = node.fullName;
            delete node.fullName;
        }
        if ("page" in node && !node.items) node.items = [];
        if ("hasCompleted" in node && !node.attempts) node.attempts = [];
        if ("tripId" in node && ("assignedAt" in node || "hasCompleted" in node) && node.fareAmount === undefined) node.fareAmount = null;
        if ("tripAvailability" in node) node.tripAvailability = { TRIP_AVAILABLE: "AVAILABLE", TRIP_UNAVAILABLE: "UNAVAILABLE", NOT_CREATED: "NOT_CREATED" }[node.tripAvailability];
        if ("paymentAvailability" in node)
            node.paymentAvailability = { PAYMENT_AVAILABLE: "AVAILABLE", PAYMENT_UNAVAILABLE: "UNAVAILABLE", NOT_APPLICABLE: "NOT_APPLICABLE" }[node.paymentAvailability];
        if (Object.hasOwn(node,'relatedEntityId')) {
            const field={BOOKING:'bid',TRIP:'tid',PAYMENT:'pid',DRIVER:'did'}[node.relatedEntityType];
            if(field) { node[field]=node.relatedEntityId; delete node.relatedEntityId; }
        }
        for(const [oldName,newName] of Object.entries(publicNames)) {
            if(Object.hasOwn(node,oldName)) { node[newName]=node[oldName]; delete node[oldName]; }
        }
        for (const child of Object.values(node)) if (typeof child === "object") complete(child);
    }
    complete(result);
    return result;
}
module.exports = { match, normalizeBody, validate, snake, camel, routes, input, output, normalizeSchema, publicNames };
