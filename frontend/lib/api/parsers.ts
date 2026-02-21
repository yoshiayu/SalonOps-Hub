import {
  periodValues,
  roleValues,
  scopeValues,
  storeTypeValues,
  type Period,
  type Role,
  type Scope,
  type StoreType
} from "@/lib/types";

function asEnum<T extends readonly string[]>(
  value: string | null,
  allowed: T
): T[number] | undefined {
  if (!value) {
    return undefined;
  }
  return (allowed as readonly string[]).includes(value) ? (value as T[number]) : undefined;
}

export function parseScope(value: string | null): Scope | undefined {
  return asEnum(value, scopeValues);
}

export function parsePeriod(value: string | null): Period | undefined {
  return asEnum(value, periodValues);
}

export function parseRole(value: string | null): Role | undefined {
  return asEnum(value, roleValues);
}

export function parseStoreType(value: string | null): StoreType | undefined {
  return asEnum(value, storeTypeValues);
}

export function parseBoolean(value: string | null): boolean | undefined {
  if (value === null || value === "") {
    return undefined;
  }
  if (["true", "1", "yes"].includes(value.toLowerCase())) {
    return true;
  }
  if (["false", "0", "no"].includes(value.toLowerCase())) {
    return false;
  }
  return undefined;
}

export function parseDate(value: string | null, fallback: string): string {
  if (!value) {
    return fallback;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }
  return date.toISOString().slice(0, 10);
}
