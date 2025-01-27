/* eslint-disable @typescript-eslint/ban-ts-comment */
import server from '../projects/server/dist/server.js';

// @ts-ignore
export default async function handler(req, reply) {
    server.server.emit('request', req, reply)
}