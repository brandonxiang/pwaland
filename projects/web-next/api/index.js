"use strict";

// 引入 Fastify 框架
import Fastify from "fastify";

// 实例化 Fastify
const app = Fastify({
  logger: true,
});

// 将应用注册为一个常规插件
app.register(import("../../server/dist/server.mjs"));

export default async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
}