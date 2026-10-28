"use strict";
const path = require("node:path");
const grpc = require("@grpc/grpc-js");
const loader = require("@grpc/proto-loader");
const { MongoClient } = require("mongodb");
const amqp = require("amqplib");
const { services, required, port, rabbitConfig } = require("../scripts/runtime-config.cjs");
const Health = grpc.loadPackageDefinition(loader.loadSync(path.join(__dirname, "../proto/grpc/health/v1/health.proto"), { enums: String })).grpc.health.v1.Health;
async function probeService(name) {
    const prefix = name.replace("_service", "").toUpperCase();
    const client = new Health(required(prefix + "_GRPC_HOST") + ":" + port(prefix + "_GRPC_PORT", 50051 + services.indexOf(name)), grpc.credentials.createInsecure());
    const metadata = new grpc.Metadata();
    metadata.set("x-service-name", "gateway");
    metadata.set("x-internal-secret", required("GRPC_INTERNAL_SECRET"));
    try {
        return await new Promise((resolve) => client.check({ service: name }, metadata, { deadline: new Date(Date.now() + 2000) }, (e, r) => resolve(!e && r.status === "SERVING")));
    } finally {
        client.close();
    }
}
async function infrastructure(name, redis) {
    if (name === "redis") {
        if (!redis.isReady) return false;
        return (await redis.ping()) === "PONG";
    }
    if (name === "mongodb") {
        // ping/hello need no business database access; Gateway receives no DB owner credential.
        const client = new MongoClient("mongodb://" + required("MONGODB_HOST") + ":" + port("MONGODB_PORT", 27017) + "/?directConnection=true", {
            serverSelectionTimeoutMS: 1500,
            connectTimeoutMS: 1500,
        });
        try {
            await client.connect();
            const hello = await client.db("admin").command({ hello: 1 });
            return hello.isWritablePrimary === true;
        } finally {
            await client.close();
        }
    }
    let connection;
    try {
        connection = await amqp.connect(rabbitConfig(), { timeout: 2000 });
        connection.on("error", () => {});
        return true;
    } finally {
        if (connection) await connection.close();
    }
}
async function health(operation, redis) {
    const checkedAt = new Date().toISOString();
    if (operation === "gatewayHealth") return { status: 200, body: { status: "healthy", checkedAt } };
    const names = ["gateway", ...services, "mongodb", "redis", "rabbitmq"];
    const components = await Promise.all(
        names.map(async (name) => {
            let healthy = false;
            try {
                healthy =
                    name === "gateway" ||
                    (await Promise.race([
                        services.includes(name) ? probeService(name) : infrastructure(name, redis),
                        new Promise((resolve) => {
                            const timer = setTimeout(() => resolve(false), 2500);
                            timer.unref();
                        }),
                    ]));
            } catch {}
            return { name, status: healthy ? "healthy" : "unhealthy", checkedAt: new Date().toISOString() };
        }),
    );
    const ready = components.every((c) => c.status === "healthy");
    return { status: ready ? 200 : 503, body: operation === "gatewayReady" ? { status: ready ? "ready" : "not_ready", checkedAt } : { status: ready ? "healthy" : "degraded", components, checkedAt } };
}
module.exports = { health };
