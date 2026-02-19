"use strict";

// 引入 Fastify 框架
import Fastify from "fastify";

// 实例化 Fastify
const app = Fastify({
  logger: true,
});

// 将应用注册为一个常规插件
app.register(import("../../server/dist/plugin.mjs"));

/**
 * Vercel 入口文件
 * @param {Request} req - Vercel 请求对象
 * @param {import('http').ServerResponse} res - Vercel 响应对象
 * @returns {Promise<void>}
 * @example
 * import { handler } from './api/index.js';
 * export const handler = handler;
 */
export default async (req, res) => {
  await app.ready();
  app.server.emit('request', req, res);
}