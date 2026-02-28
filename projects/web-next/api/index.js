import Fastify from "fastify";

const app = Fastify({
  logger: true,
});

app.register(import("../../server/dist/plugin.mjs"));

export default async (req, res) => {
  await app.ready();
  app.server.emit("request", req, res);
};