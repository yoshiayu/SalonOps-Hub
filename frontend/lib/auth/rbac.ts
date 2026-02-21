import { roleValues, type Role } from "@/lib/types";

export function resolveRole(raw: string | null | undefined): Role {
  if (!raw) {
    return "Admin";
  }
  return roleValues.includes(raw as Role) ? (raw as Role) : "Viewer";
}

export function canManageMaster(role: Role): boolean {
  return role === "Admin" || role === "Manager";
}

export function canGenerateReport(role: Role): boolean {
  return role === "Admin" || role === "Manager" || role === "Staff";
}

export function canEditItems(role: Role): boolean {
  return role === "Admin" || role === "Manager" || role === "Staff";
}
