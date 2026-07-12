/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

/**
 * Valid user roles in the StadiumIQ-AI platform.
 */
export type UserRole = 'admin' | 'operations' | 'security' | 'medical' | 'volunteer' | 'fan';

/**
 * Role hierarchy levels for checking permission levels.
 * Admin has absolute control, followed by operations managers and field leads.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 5,
  operations: 4,
  security: 3,
  medical: 3,
  volunteer: 2,
  fan: 1,
};

/**
 * Sanitize strings to mitigate XSS (Cross-Site Scripting) risks.
 * Safely encodes HTML tags, quotes, slashes, and removes protocols like 'javascript:'.
 * 
 * @param input The raw input string to sanitize.
 * @returns The sanitized, safe string.
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Strip null bytes
  let sanitized = input.replace(/\0/g, '');
  
  // Escape HTML entities to prevent execution of injected script tags
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };
  
  sanitized = sanitized.replace(/[&<>"'`\/=]/g, (match) => htmlEscapes[match]);
  
  // Strip javascript: pseudo-protocol strings
  sanitized = sanitized.replace(/javascript:/gi, 'no-js:');
  
  return sanitized;
}

/**
 * Recursively sanitizes all string values within an object.
 * 
 * @param obj The object containing potential unsanitized strings.
 * @returns A new object with all string properties sanitized.
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeString(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = sanitizeObject(value);
    }
    return result as T;
  }

  return obj;
}

// ==========================================
// Zod Validation Schemas for Smart Stadium Operations
// ==========================================

/**
 * Validation schema for new announcement payloads.
 */
export const AnnouncementSchema = z.object({
  title: z.string()
  .min(3, 'Title must be at least 3 characters long')
  .max(100, 'Title cannot exceed 100 characters')
  .transform(sanitizeString),
  
  message: z.string()
  .min(5, 'Message must be at least 5 characters long')
  .max(1000, 'Message cannot exceed 1000 characters')
  .transform(sanitizeString),
  
  type: z.enum(['info', 'warning', 'emergency', 'general']),
  
  language: z.string().min(2).max(10).default('en').transform(sanitizeString),
  
  generatedByAI: z.boolean().default(false),
});

/**
 * Validation schema for new incident logs.
 */
export const IncidentSchema = z.object({
  title: z.string()
  .min(3, 'Incident title must be at least 3 characters long')
  .max(100, 'Incident title cannot exceed 100 characters')
  .transform(sanitizeString),
  
  description: z.string()
  .min(5, 'Incident description must be at least 5 characters long')
  .max(1000, 'Incident description cannot exceed 1000 characters')
  .transform(sanitizeString),
  
  type: z.enum(['security', 'medical', 'maintenance', 'crowd', 'weather', 'technical']),
  
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  
  location: z.string()
  .min(2, 'Location must be at least 2 characters long')
  .max(100, 'Location coordinate cannot exceed 100 characters')
  .transform(sanitizeString),
});

/**
 * Validation schema for match scheduling input.
 */
export const MatchScheduleSchema = z.object({
  name: z.string()
  .min(5, 'Match fixture name must be at least 5 characters long')
  .max(100, 'Match fixture name cannot exceed 100 characters')
  .transform(sanitizeString),
  
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format (24-hour)'),
  
  durationMinutes: z.number().int().positive().default(120),
  
  sectorId: z.string().min(1, 'Target sector ID is required').transform(sanitizeString),
});

// ==========================================
// RBAC Guards & Parameterized Middleware Helpers
// ==========================================

/**
 * Configurable access configuration options (no hardcoded defaults).
 */
export interface SecurityConfigOptions {
  superUserRole: UserRole;
  authHeaderName: string;
}

/**
 * Checks if a user's role has sufficient permission to access a resource, 
 * using both exact list allowance and hierarchical authorization checking.
 * 
 * @param userRole The active role of the authenticated user.
 * @param allowedRoles The list of explicit roles allowed to access.
 * @param minHierarchyRequired Optional minimum hierarchy rank required.
 * @param options Configurable security options.
 * @returns boolean true if authorized, false otherwise.
 */
export function isAuthorized(
  userRole: UserRole,
  allowedRoles: UserRole[],
  minHierarchyRequired?: number,
  options: SecurityConfigOptions = { superUserRole: 'admin', authHeaderName: 'x-user-role' }
): boolean {
  try {
    // Superuser bypasses all role constraints
    if (userRole === options.superUserRole) {
      return true;
    }

    // Direct role inclusion check
    if (allowedRoles.includes(userRole)) {
      return true;
    }

    // Hierarchical check
    if (minHierarchyRequired !== undefined) {
      const userRank = ROLE_HIERARCHY[userRole] || 0;
      if (userRank >= minHierarchyRequired) {
        return true;
      }
    }

    return false;
  } catch (error) {
    // Explicit fail-safe (deny by default on error)
    return false;
  }
}

/**
 * Extracts and authorizes the request based on request headers.
 * 
 * @param request The incoming Request object.
 * @param allowedRoles Array of roles authorized to view this route.
 * @param minHierarchyRequired Optional hierarchical tier threshold.
 * @param config Security override configurations.
 * @returns An object containing authorization status and user information.
 */
export async function authorizeRequest(
  request: Request,
  allowedRoles: UserRole[],
  minHierarchyRequired?: number,
  config: SecurityConfigOptions = { superUserRole: 'admin', authHeaderName: 'x-user-role' }
): Promise<{ authorized: boolean; role?: UserRole; errorResponse?: Response }> {
  try {
    const roleHeader = request.headers.get(config.authHeaderName);
    
    if (!roleHeader) {
      return {
        authorized: false,
        errorResponse: new Response(
          JSON.stringify({ error: 'Unauthorized: Missing credentials or role token' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    const cleanedRole = roleHeader.trim().toLowerCase() as UserRole;
    
    // Validate role validity
    if (!ROLE_HIERARCHY.hasOwnProperty(cleanedRole)) {
      return {
        authorized: false,
        errorResponse: new Response(
          JSON.stringify({ error: 'Forbidden: Invalid role token provided' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    const permitted = isAuthorized(cleanedRole, allowedRoles, minHierarchyRequired, config);

    if (!permitted) {
      return {
        authorized: cleanedRole === 'admin', // admin might be bypassed
        role: cleanedRole,
        errorResponse: new Response(
          JSON.stringify({ error: `Forbidden: Insufficient privileges for role '${cleanedRole}'` }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        ),
      };
    }

    return {
      authorized: true,
      role: cleanedRole,
    };
  } catch (error) {
    // Fail-safe error catch (Close security gates on error)
    return {
      authorized: false,
      errorResponse: new Response(
        JSON.stringify({ error: 'Internal Security Guard Failure' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }
}
