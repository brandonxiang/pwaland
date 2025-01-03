import IORedis, { RedisKey } from 'ioredis';
import { getConfig } from '../config';

const config = getConfig();

function initRedis() {
  // 如果提供了多个地址, 使用Redis Cluster
  if (config.redis.cluster.length > 1) {
    return new IORedis.Cluster(config.redis.cluster, {
      scaleReads: 'slave',
      dnsLookup: (address: string, callback: any) => {
        console.log('redis dnsLookup log', address);
        callback(null, address);
      },
      redisOptions: {
        password: config.redis.password,
      },
    });
  }

  console.log(`config.redis.cluster[0]: ${config.redis.cluster[0]}`);

  // 如果只提供了一个地址, 不使用Cluster
  return new IORedis({
    ...config.redis.cluster[0],
    password: config.redis.password,
  });
}

const redis = initRedis();

export async function hget(key: string, filed: string) {
  return redis.hget(key, filed);
}

export async function hmget(key: RedisKey, ...fields: string[]) {
  return redis.hmget(key, ...fields);
}

export async function hgetall(key: string) {
  return redis.hgetall(key);
}

export function hset(key: string, filed: string, value: string | Record<string, any>) {
  return redis.hset(key, filed, typeof value === 'string' ? value : JSON.stringify(value));
}

export function hmset(key: string, sets: Record<string, string | Record<string, any>>) {
  const args = Object.keys(sets).reduce((prev: string[], k: string) => {
    const value = sets[k];
    prev.push(k, typeof value === 'string' ? value : JSON.stringify(value));
    return prev;
  }, []);

  if (args.length) {
    return redis.hmset(key, ...args);
  }
}

export async function hkeys(key: string) {
  return redis.hkeys(key);
}

export function hdel(key: string, fields: string[]) {
  if (fields.length) {
    return redis.hdel(key, ...fields);
  }
}

export async function setex(key: string, seconds: number, value: string | Record<string, any> | Buffer) {
  return redis.setex(key, seconds, typeof value === 'string' ? value : JSON.stringify(value));
}

export async function getex(key: string) {
  return redis.get(key); // 集群redis 不支持 getex
}

export async function getKeys(pattern: string) {
  return redis.keys(pattern);
}

export async function delKeys(keys: string[]) {
  return redis.del(keys);
}

export function get(key: string) {
  return redis.get(key);
}
export function set(key: string, value: string) {
  return redis.set(key, value);
}
