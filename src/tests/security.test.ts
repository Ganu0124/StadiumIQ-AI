import { sanitizeString, sanitizeObject, isAuthorized, AnnouncementSchema, IncidentSchema } from '../lib/core/security';

describe('Security Layer (Input Sanitization & RBAC)', () => {
  
  describe('XSS Sanitization', () => {
    it('should escape HTML tags and special quotes', () => {
      const untrusted = '<script>alert("hack")</script>';
      const sanitized = sanitizeString(untrusted);
      
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
      expect(sanitized).toContain('&quot;hack&quot;');
    });

    it('should strip javascript pseudo-protocol strings', () => {
      const exploit = 'javascript:alert(1)';
      const sanitized = sanitizeString(exploit);
      
      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('no-js:');
    });

    it('should sanitize nested objects recursively', () => {
      const rawPayload = {
        title: 'Safe Title',
        details: {
          xssPayload: '<img src=x onerror=alert(1)>',
          tags: ['<b>test</b>', 'normal'],
        },
      };

      const cleanPayload = sanitizeObject(rawPayload);
      expect(cleanPayload.details.xssPayload).toBe('&lt;img src&#x3D;x onerror&#x3D;alert(1)&gt;'); // note: zod handles '=' or we escape standard tags
      // Let's verify standard HTML tag escaping
      expect(cleanPayload.details.tags[0]).toContain('&lt;b&gt;test&lt;&#x2F;b&gt;');
    });
  });

  describe('Zod Schemas Validation', () => {
    it('should validate announcements and sanitize string outputs', () => {
      const badInput = {
        title: 'Incident <i>Alert</i>',
        message: 'A minor crowd swell <script>inject()</script>',
        type: 'warning',
        language: 'en',
      };

      const result = AnnouncementSchema.safeParse(badInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toContain('&lt;i&gt;Alert&lt;&#x2F;i&gt;');
        expect(result.data.message).not.toContain('<script>');
      }
    });

    it('should fail validation on invalid fields', () => {
      const badInput = {
        title: 'Hi', // too short, min is 3
        message: 'No', // too short, min is 5
        type: 'invalid-type-value', // invalid enum
      };

      const result = AnnouncementSchema.safeParse(badInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.format();
        expect(error.title).toBeDefined();
        expect(error.message).toBeDefined();
        expect(error.type).toBeDefined();
      }
    });
  });

  describe('Role-Based Access Control (RBAC)', () => {
    it('should authorize direct allowed roles', () => {
      expect(isAuthorized('operations', ['operations', 'security'])).toBe(true);
      expect(isAuthorized('fan', ['operations', 'security'])).toBe(false);
    });

    it('should bypass checks for administrative superusers', () => {
      expect(isAuthorized('admin', ['volunteer'])).toBe(true);
    });

    it('should evaluate hierarchical clearance tiers correctly', () => {
      // Operations (rank 4) has clearance for minHierarchyRequired = 3 (security/medical)
      expect(isAuthorized('operations', [], 3)).toBe(true);
      
      // Fan (rank 1) lacks clearance for minHierarchyRequired = 2
      expect(isAuthorized('fan', [], 2)).toBe(false);
    });
  });
});
