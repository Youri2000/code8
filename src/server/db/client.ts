import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/env";

import * as schema from "./schema";

const sql = postgres(env.DATABASE_URL);

export const db = drizzle(sql, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
/** 数据访问函数接受连接或事务，便于业务用例组合事务、测试用事务回滚隔离。 */
export type DbOrTx = Db | Tx;
