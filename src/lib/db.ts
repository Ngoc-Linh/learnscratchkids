import { randomUUID } from "node:crypto";
import { readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

type Row = Record<string, any>;
type TableName =
  | "user"
  | "enrollment"
  | "project"
  | "comment"
  | "heart"
  | "vote"
  | "submission"
  | "redemption"
  | "guideArticle";

type Database = {
  user: Row[];
  enrollment: Row[];
  project: Row[];
  comment: Row[];
  heart: Row[];
  vote: Row[];
  submission: Row[];
  redemption: Row[];
  guideArticle: Row[];
  guideSeeded: boolean;
};

type ModelClient = {
  findUnique<T = Row>(args: Row): Promise<T | null>;
  findMany<T = Row>(args?: Row): Promise<T[]>;
  count(args?: Row): Promise<number>;
  groupBy(args: Row): Promise<Row[]>;
  create(args: Row): Promise<Row>;
  update(args: Row): Promise<Row>;
  updateMany(args: Row): Promise<{ count: number }>;
  delete(args: Row): Promise<Row>;
  upsert(args: Row): Promise<Row>;
};

type JsonClient = Record<TableName, ModelClient> & {
  $transaction<T>(callback: (tx: JsonClient) => Promise<T>): Promise<T>;
};

const databasePath = path.join(process.cwd(), "scratchkids.json");
const tableNames: TableName[] = [
  "user",
  "enrollment",
  "project",
  "comment",
  "heart",
  "vote",
  "submission",
  "redemption",
  "guideArticle",
];
const emptyDatabase = (): Database => ({
  user: [],
  enrollment: [],
  project: [],
  comment: [],
  heart: [],
  vote: [],
  submission: [],
  redemption: [],
  guideArticle: [],
  guideSeeded: true,
});

let writeQueue: Promise<void> = Promise.resolve();
let initialization: Promise<void> | undefined;

function hydrate(value: unknown): Database {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("scratchkids.json phải chứa một object JSON hợp lệ.");
  }
  const parsed = value as Partial<Database>;
  const database = emptyDatabase();
  const hasGuideArticleCollection = Array.isArray(parsed.guideArticle);
  database.guideSeeded = parsed.guideSeeded ?? hasGuideArticleCollection;
  for (const table of tableNames) {
    const rows = parsed[table];
    if (rows !== undefined && !Array.isArray(rows)) {
      throw new Error(`Dữ liệu bảng "${table}" trong scratchkids.json không hợp lệ.`);
    }
    database[table] = (rows ?? []).map((row) => {
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        throw new Error(`Có bản ghi không hợp lệ trong bảng "${table}".`);
      }
      const hydrated = { ...row } as Row;
      for (const key of ["createdAt", "updatedAt", "reviewedAt"]) {
        if (typeof hydrated[key] === "string") hydrated[key] = new Date(hydrated[key]);
      }
      return hydrated;
    });
  }
  return database;
}

async function load(): Promise<Database> {
  try {
    const database = hydrate(JSON.parse(await readFile(databasePath, "utf8")));
    if (!database.guideSeeded) {
      const { createGuideSeedArticles } = await import("./guide-seed");
      database.guideArticle = createGuideSeedArticles();
      database.guideSeeded = true;
      await persist(database);
    }
    return database;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const database = hydrate({ ...emptyDatabase(), guideSeeded: false });
    const { createGuideSeedArticles } = await import("./guide-seed");
    database.guideArticle = createGuideSeedArticles();
    database.guideSeeded = true;
    await persist(database);
    return database;
  }
}

async function persist(database: Database): Promise<void> {
  const temporaryPath = `${databasePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
  await rename(temporaryPath, databasePath);
}

async function ensureInitialized(): Promise<void> {
  if (!initialization) initialization = load().then(() => undefined);
  await initialization;
}

function matches(row: Row, where: Row = {}): boolean {
  return Object.entries(where).every(([key, condition]) => {
    if (key === "OR") return Array.isArray(condition) && condition.some((item) => matches(row, item));
    if (key === "AND") return Array.isArray(condition) && condition.every((item) => matches(row, item));

    const value = row[key];
    if (condition && typeof condition === "object" && !(condition instanceof Date) && !Array.isArray(condition)) {
      if (!(key in row)) {
        return Object.entries(condition).every(([nestedKey, nestedValue]) => row[nestedKey] === nestedValue);
      }
      return Object.entries(condition as Row).every(([operator, expected]) => {
        if (operator === "in") return Array.isArray(expected) && expected.includes(value);
        if (operator === "not") return value !== expected;
        if (operator === "gte") return value instanceof Date
          ? new Date(expected).getTime() <= value.getTime()
          : typeof value === "number" && value >= expected;
        if (operator === "gt") return value instanceof Date
          ? new Date(expected).getTime() < value.getTime()
          : typeof value === "number" && value > expected;
        if (operator === "lte") return value instanceof Date
          ? new Date(expected).getTime() >= value.getTime()
          : typeof value === "number" && value <= expected;
        if (operator === "lt") return value instanceof Date
          ? new Date(expected).getTime() > value.getTime()
          : typeof value === "number" && value < expected;
        return false;
      });
    }
    return value === condition;
  });
}

function sortRows(rows: Row[], orderBy?: Row | Row[]): Row[] {
  if (!orderBy) return rows;
  const rules = Array.isArray(orderBy) ? orderBy : [orderBy];
  return rows.sort((a, b) => {
    for (const rule of rules) {
      for (const [key, directionValue] of Object.entries(rule)) {
        const direction =
          typeof directionValue === "string"
            ? directionValue
            : directionValue && typeof directionValue === "object" && "sort" in directionValue
              ? directionValue.sort
              : "asc";
        const left = a[key] instanceof Date ? a[key].getTime() : a[key];
        const right = b[key] instanceof Date ? b[key].getTime() : b[key];
        if (left === right) continue;
        if (left == null || right == null) {
          const nullsFirst =
            directionValue !== null &&
            typeof directionValue === "object" &&
            "nulls" in directionValue &&
            directionValue.nulls === "first";
          return left == null ? (nullsFirst ? -1 : 1) : (nullsFirst ? 1 : -1);
        }
        return (left < right ? -1 : 1) * (direction === "desc" ? -1 : 1);
      }
    }
    return 0;
  });
}

function project(row: Row, args: Row = {}, database: Database, table: TableName): Row {
  let result = { ...row };
  if (args.select) {
    result = {};
    for (const [key, enabled] of Object.entries(args.select)) {
      if (enabled === true && key in row) result[key] = row[key];
      if (key === "_count" && enabled) result._count = countsFor(database, table, row);
      if (enabled && typeof enabled === "object") {
        result[key] = projectRelation(database, table, row, key, enabled);
      }
    }
  }
  if (args.include) {
    for (const [key, enabled] of Object.entries(args.include)) {
      if (key === "_count" && enabled) result._count = countsFor(database, table, row);
      else if (enabled) result[key] = projectRelation(database, table, row, key, enabled);
    }
  }
  return result;
}

function countsFor(database: Database, table: TableName, row: Row): Row {
  if (table !== "project") return {};
  return {
    hearts: database.heart.filter((item) => item.projectId === row.id).length,
    comments: database.comment.filter((item) => item.projectId === row.id).length,
  };
}

function projectRelation(database: Database, table: TableName, row: Row, relation: string, args: Row): any {
  const relationRows: Record<string, [TableName, Row[]]> = {
    user: ["user", database.user.filter((item) => item.id === row.userId)],
    enrollments: ["enrollment", database.enrollment.filter((item) => item.userId === row.id)],
  };
  const entry = relationRows[relation];
  if (!entry || (table !== "submission" && table !== "redemption" && table !== "comment" && table !== "user")) return undefined;
  const [relatedTable, rows] = entry;
  const sorted = sortRows(rows.filter((item) => matches(item, args.where)), args.orderBy);
  const filtered = args.take === undefined ? sorted : sorted.slice(0, args.take);
  const values = filtered.map((item) => project(item, args, database, relatedTable));
  return relation === "user" ? values[0] ?? null : values;
}

function findOne(rows: Row[], where: Row): Row | undefined {
  return rows.find((row) => matches(row, where));
}

function applyData(row: Row, data: Row): Row {
  const result = { ...row };
  for (const [key, value] of Object.entries(data)) {
    if (value && typeof value === "object" && !(value instanceof Date)) {
      if (typeof value.increment === "number") result[key] = (result[key] ?? 0) + value.increment;
      else if (typeof value.decrement === "number") result[key] = (result[key] ?? 0) - value.decrement;
      else result[key] = value;
    } else {
      result[key] = value;
    }
  }
  if ("updatedAt" in result) result.updatedAt = new Date();
  return result;
}

function checkUnique(table: TableName, candidate: Row, rows: Row[], ignored?: Row): void {
  const uniqueFields: Partial<Record<TableName, string[][]>> = {
    user: [["id"], ["phone"], ["email"]],
    enrollment: [["id"]],
    project: [["id"]],
    comment: [["id"]],
    heart: [["userId", "projectId"]],
    vote: [["id"], ["userId", "month"]],
    submission: [["id"], ["userId", "courseSlug", "lessonNo"]],
    redemption: [["id"]],
    guideArticle: [["id"], ["slug"]],
  };
  for (const fields of uniqueFields[table] ?? []) {
    if (fields.every((field) => candidate[field] != null) && rows.some((row) =>
      row !== ignored && fields.every((field) => row[field] === candidate[field]))) {
      throw new Error(`Dữ liệu bị trùng khóa duy nhất: ${table}.${fields.join("_")}`);
    }
  }
}

function createClient(getDatabase: () => Database, persistChanges: (db: Database) => Promise<void>): JsonClient {
  const client: Row = {};
  for (const table of tableNames) {
    client[table] = {
      findUnique: async (args: Row) => {
        const row = findOne(getDatabase()[table], args.where);
        return row ? project(row, args, getDatabase(), table) : null;
      },
      findMany: async (args: Row = {}) => {
        const rows = sortRows(getDatabase()[table].filter((row) => matches(row, args.where)), args.orderBy);
        const selected = args.take === undefined ? rows : rows.slice(0, args.take);
        return selected.map((row) => project(row, args, getDatabase(), table));
      },
      count: async (args: Row = {}) => getDatabase()[table].filter((row) => matches(row, args.where)).length,
      groupBy: async (args: Row) => {
        const groups = new Map<string, Row>();
        for (const row of getDatabase()[table].filter((item) => matches(item, args.where))) {
          const key = JSON.stringify(args.by.map((field: string) => row[field]));
          const group = groups.get(key) ?? Object.fromEntries(args.by.map((field: string) => [field, row[field]]));
          group._count = { _all: (group._count?._all ?? 0) + 1 };
          groups.set(key, group);
        }
        return [...groups.values()];
      },
      create: async (args: Row) => {
        const database = getDatabase();
        const now = new Date();
        const row: Row = {
          id: randomUUID(),
          createdAt: now,
          ...(table === "guideArticle" ? { updatedAt: now } : {}),
          ...(table === "user" ? { role: "USER", isActive: true, stars: 0 } : {}),
          ...(table === "enrollment" ? { status: "NEW", isTrial: true } : {}),
          ...(table === "submission" ? { bonusStars: 0, createdAt: now, updatedAt: now } : {}),
          ...(table === "redemption" ? { status: "PENDING" } : {}),
          ...args.data,
        };
        checkUnique(table, row, database[table]);
        database[table].push(row);
        await persistChanges(database);
        return project(row, args, database, table);
      },
      update: async (args: Row) => {
        const database = getDatabase();
        const rows = database[table];
        const index = rows.findIndex((row) => matches(row, args.where));
        if (index < 0) throw new Error(`Không tìm thấy bản ghi ${table}.`);
        const updated = applyData(rows[index], args.data);
        checkUnique(table, updated, rows, rows[index]);
        rows[index] = updated;
        await persistChanges(database);
        return project(updated, args, database, table);
      },
      updateMany: async (args: Row) => {
        const database = getDatabase();
        const rows = database[table];
        let count = 0;
        for (let i = 0; i < rows.length; i++) {
          if (matches(rows[i], args.where)) {
            rows[i] = applyData(rows[i], args.data);
            count++;
          }
        }
        if (count) await persistChanges(database);
        return { count };
      },
      delete: async (args: Row) => {
        const database = getDatabase();
        const rows = database[table];
        const index = rows.findIndex((row) => matches(row, args.where));
        if (index < 0) throw new Error(`Không tìm thấy bản ghi ${table}.`);
        const [deleted] = rows.splice(index, 1);
        await persistChanges(database);
        return deleted;
      },
      upsert: async (args: Row) => {
        const existing = findOne(getDatabase()[table], args.where);
        if (existing) return client[table].update({ where: args.where, data: args.update });
        return client[table].create({ data: args.create });
      },
    };
  }
  return client as JsonClient;
}

async function mutate<T>(action: (database: Database) => Promise<T>): Promise<T> {
  let result!: T;
  const operation = writeQueue.then(async () => {
    await ensureInitialized();
    const database = await load();
    result = await action(database);
    await persist(database);
  });
  writeQueue = operation.catch(() => undefined);
  await operation;
  return result;
}

function operationClient(database: Database): JsonClient {
  return createClient(() => database, async () => undefined);
}

const jsonDatabase: Row = {};
for (const table of tableNames) {
  jsonDatabase[table] = {};
  for (const method of ["findUnique", "findMany", "count", "groupBy"]) {
    jsonDatabase[table][method] = async (args: Row = {}) => {
      await ensureInitialized();
      const database = await load();
      return (operationClient(database)[table] as Row)[method](args);
    };
  }
  for (const method of ["create", "update", "updateMany", "delete", "upsert"]) {
    jsonDatabase[table][method] = (args: Row) =>
      mutate((database) => (operationClient(database)[table] as Row)[method](args));
  }
}

jsonDatabase.$transaction = async <T>(callback: (tx: JsonClient) => Promise<T>): Promise<T> => {
  let result!: T;
  const operation = writeQueue.then(async () => {
    await ensureInitialized();
    const database = await load();
    result = await callback(operationClient(database));
    await persist(database);
  });
  writeQueue = operation.catch(() => undefined);
  await operation;
  return result;
};

export const db = jsonDatabase as JsonClient;

// Keep existing call sites explicit about failures while the file remains the single source of truth.
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("[json-db] query failed:", error instanceof Error ? error.message : error);
    return fallback;
  }
}
