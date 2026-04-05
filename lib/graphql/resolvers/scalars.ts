
import { GraphQLScalarType, Kind, ValueNode } from "graphql";
import { z, ZodError } from "zod";

/* ------------------------------------------------------------------ */
/* ZOD SCHEMAS */
/* ------------------------------------------------------------------ */

export const dateTimeSchema = z.union([
  z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, { message: "Invalid date string" }),
  z.date(),
  z.number().int().nonnegative(),
]);

export const jsonSchema = z.any();

/* ------------------------------------------------------------------ */
/* UTILS */
/* ------------------------------------------------------------------ */

function isZodError(error: unknown): error is ZodError {
  return error instanceof ZodError;
}

function toDate(value: string | number | Date): Date {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid Date");
  }
  return date;
}

function getZodErrorMessage(error: ZodError): string {
  return error.issues.map(issue => issue.message).join(", ");
}

/* ------------------------------------------------------------------ */
/* DateTime SCALAR */
/* ------------------------------------------------------------------ */

export const DateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  description: "ISO-8601 compliant DateTime scalar",

  serialize(value: unknown): string {
    try {
      const validated = dateTimeSchema.parse(value);
      return toDate(validated).toISOString();
    } catch (error) {
      if (isZodError(error)) {
        throw new Error(`Invalid DateTime value: ${getZodErrorMessage(error)}`);
      }
      throw new Error(`Invalid DateTime value: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  parseValue(value: unknown): Date {
    try {
      const validated = dateTimeSchema.parse(value);
      return toDate(validated);
    } catch (error) {
      if (isZodError(error)) {
        throw new Error(`Invalid DateTime value: ${getZodErrorMessage(error)}`);
      }
      throw new Error(`Invalid DateTime value: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
      try {
        const value = ast.kind === Kind.INT ? Number(ast.value) : ast.value;
        const validated = dateTimeSchema.parse(value);
        return toDate(validated);
      } catch (error) {
        if (isZodError(error)) {
          throw new Error(`Invalid DateTime literal: ${getZodErrorMessage(error)}`);
        }
        throw new Error(`Invalid DateTime literal: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    throw new Error("DateTime literal must be STRING or INT");
  },
});

/* ------------------------------------------------------------------ */
/* JSON SCALAR */
/* ------------------------------------------------------------------ */

export const JSONScalar = new GraphQLScalarType({
  name: "JSON",
  description: "ECMA-404 compliant JSON scalar",

  serialize(value: unknown): unknown {
    try {
      jsonSchema.parse(value);

      const seen = new WeakSet();
      return JSON.parse(
        JSON.stringify(value, (_key, val) => {
          if (typeof val === "object" && val !== null) {
            if (seen.has(val)) return "[Circular]";
            seen.add(val);
          }
          return val;
        })
      );
    } catch (error) {
      if (isZodError(error)) {
        throw new Error(`Invalid JSON value: ${getZodErrorMessage(error)}`);
      }
      if (error instanceof Error && error.message.includes("circular")) {
        throw new Error("Circular reference detected in JSON value");
      }
      throw new Error(`Invalid JSON value: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  parseValue(value: unknown): unknown {
    try {
      jsonSchema.parse(value);
      return value;
    } catch (error) {
      if (isZodError(error)) {
        throw new Error(`Invalid JSON value: ${getZodErrorMessage(error)}`);
      }
      throw new Error(`Invalid JSON value: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  parseLiteral(ast: ValueNode): unknown {
    const parseNode = (node: ValueNode): unknown => {
      switch (node.kind) {
        case Kind.STRING:
        case Kind.BOOLEAN:
          return node.value;
        case Kind.INT:
          return parseInt(node.value, 10);
        case Kind.FLOAT:
          return parseFloat(node.value);
        case Kind.NULL:
          return null;
        case Kind.ENUM:
          return node.value;
        case Kind.LIST:
          return node.values.map(parseNode);
        case Kind.OBJECT: {
          const obj: Record<string, unknown> = {};
          for (const field of node.fields) {
            obj[field.name.value] = parseNode(field.value);
          }
          return obj;
        }
        case Kind.VARIABLE:
          throw new Error("Variables are not supported in JSON literals");
        default:
          const _exhaustive: never = node;
          return _exhaustive;
      }
    };

    try {
      const result = parseNode(ast);
      jsonSchema.parse(result);
      return result;
    } catch (error) {
      if (isZodError(error)) {
        throw new Error(`Invalid JSON literal: ${getZodErrorMessage(error)}`);
      }
      throw new Error(`Invalid JSON literal: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

/* ------------------------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------------------------ */

export function validateDateTime(value: unknown): Date {
  try {
    const validated = dateTimeSchema.parse(value);
    return toDate(validated);
  } catch (error) {
    if (isZodError(error)) {
      throw new Error(`Invalid DateTime: ${getZodErrorMessage(error)}`);
    }
    throw new Error(`Invalid DateTime: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function validateJSON<T>(
  value: unknown,
  schema?: z.ZodType<T>
): T {
  try {
    const json = jsonSchema.parse(value);
    return schema ? schema.parse(json) : (json as T);
  } catch (error) {
    if (isZodError(error)) {
      throw new Error(`Invalid JSON: ${getZodErrorMessage(error)}`);
    }
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function safeParseJSON<T>(
  jsonString: string,
  schema?: z.ZodType<T>
): T {
  try {
    const parsed = JSON.parse(jsonString);
    return validateJSON(parsed, schema);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON string: ${error.message}`);
    }
    throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function toJSONSerializable(value: unknown): unknown {
  try {
    return JSONScalar.serialize(value);
  } catch (error) {
    throw new Error(`Failed to serialize to JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function isValidJSON(value: unknown): boolean {
  try {
    jsonSchema.parse(value);
    return true;
  } catch {
    return false;
  }
}