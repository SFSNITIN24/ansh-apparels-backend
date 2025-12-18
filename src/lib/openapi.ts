import type { Product } from "@/types/product";
import type { PublicUser } from "@/types/user";

export function getOpenApiSpec() {
  // Keep spec static + simple (good for Vercel). UI can call your deployed backend.
  return {
    openapi: "3.0.3",
    info: {
      title: "Ansh Apparels Backend API",
      version: "1.0.0",
      description:
        "Backend API for Ansh Apparels. Includes products and auth (cookie session).",
    },
    servers: [{ url: "/" }],
    tags: [
      { name: "Health" },
      { name: "Products" },
      { name: "Auth" },
      { name: "Admin" },
      { name: "Contact" },
    ],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "ansh_session",
          description:
            "Session cookie set by /api/auth/login. Sent automatically by browser when using Swagger UI on same origin.",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
        },
        ProductSize: {
          type: "object",
          properties: {
            label: { type: "string", example: "M" },
            quantity: { type: "number", example: 10, description: "Available stock. 0 means out of stock." },
          },
          required: ["label", "quantity"],
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "number" },
            name: { type: "string" },
            slug: { type: "string" },
            price: { type: "number" },
            category: { type: "string", enum: ["men", "women"] },
            sizes: { type: "array", items: { $ref: "#/components/schemas/ProductSize" } },
            images: { type: "array", items: { type: "string" } },
          },
          required: ["id", "name", "slug", "price", "category", "sizes", "images"],
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            role: { type: "string", enum: ["user", "admin"] },
            isAdmin: {
              type: "boolean",
              description:
                "Convenience field. Note: /api/auth/signup always returns isAdmin=false; use /api/auth/me or /api/auth/login to get effective admin status.",
            },
          },
          required: ["id", "name", "email", "role", "isAdmin"],
        },
      },
    },
    paths: {
      "/api/contact": {
        options: { tags: ["Contact"], responses: { 204: { description: "CORS preflight" } } },
        post: {
          tags: ["Contact"],
          summary: "Submit contact message",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    phone: { type: "string" },
                    email: { type: "string" },
                    message: { type: "string" },
                  },
                  required: ["name", "message"],
                },
              },
            },
          },
          responses: {
            200: { description: "Saved" },
            400: {
              description: "Bad request",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      "/api/admin/products": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Admin"],
          summary: "Admin list products",
          security: [{ sessionCookie: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" } },
        },
        post: {
          tags: ["Admin"],
          summary: "Admin create product",
          security: [{ sessionCookie: [] }],
          responses: { 200: { description: "Created" }, 400: { description: "Bad request" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" } },
        },
      },
      "/api/admin/products/{id}": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        patch: {
          tags: ["Admin"],
          summary: "Admin update product",
          security: [{ sessionCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
          responses: { 200: { description: "Updated" }, 400: { description: "Bad request" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" }, 404: { description: "Not found" } },
        },
        delete: {
          tags: ["Admin"],
          summary: "Admin delete product",
          security: [{ sessionCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "number" } }],
          responses: { 200: { description: "Deleted" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" }, 404: { description: "Not found" } },
        },
      },
      "/api/admin/users": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Admin"],
          summary: "Admin list users",
          security: [{ sessionCookie: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" } },
        },
      },
      "/api/admin/users/{id}": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        patch: {
          tags: ["Admin"],
          summary: "Admin set user role",
          security: [{ sessionCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { role: { type: "string", enum: ["user", "admin"] } },
                  required: ["role"],
                },
              },
            },
          },
          responses: { 200: { description: "Updated" }, 400: { description: "Bad request" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" }, 404: { description: "Not found" } },
        },
      },
      "/api/admin/verify": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Admin"],
          summary: "Admin verify (is logged-in admin?)",
          security: [{ sessionCookie: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" } },
        },
      },
      "/api/admin/contacts": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Admin"],
          summary: "Admin list contact messages",
          security: [{ sessionCookie: [] }],
          responses: { 200: { description: "OK" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" } },
        },
      },
      "/api/admin/contacts/{id}": {
        options: { tags: ["Admin"], responses: { 204: { description: "CORS preflight" } } },
        delete: {
          tags: ["Admin"],
          summary: "Admin delete contact message",
          security: [{ sessionCookie: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Deleted" }, 401: { description: "Not logged in" }, 403: { description: "Not authorized" }, 404: { description: "Not found" } },
        },
      },
      "/api/health": {
        options: { tags: ["Health"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Health"],
          summary: "Health check",
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      ok: { type: "boolean" },
                      service: { type: "string" },
                    },
                    required: ["ok", "service"],
                  },
                },
              },
            },
          },
        },
      },

      "/api/products": {
        options: { tags: ["Products"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Products"],
          summary: "List products",
          responses: {
            200: {
              description: "Products list",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      products: {
                        type: "array",
                        items: { $ref: "#/components/schemas/Product" },
                      },
                    },
                    required: ["products"],
                  },
                },
              },
            },
          },
        },
      },

      "/api/products/{slug}": {
        options: { tags: ["Products"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Products"],
          summary: "Get product by slug",
          parameters: [
            {
              name: "slug",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Product",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { product: { $ref: "#/components/schemas/Product" } },
                    required: ["product"],
                  },
                },
              },
            },
            404: {
              description: "Not found",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      "/api/auth/signup": {
        options: { tags: ["Auth"], responses: { 204: { description: "CORS preflight" } } },
        post: {
          tags: ["Auth"],
          summary: "Signup",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    password: { type: "string" },
                    adminCode: {
                      type: "string",
                      description:
                        "Optional admin invite code. If it matches backend env ADMIN_INVITE_CODE, the user role will be created as admin in DB. Response still returns isAdmin=false by design; use /api/auth/me after login.",
                    },
                  },
                  required: ["name", "email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Created user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { user: { $ref: "#/components/schemas/User" } },
                    required: ["user"],
                  },
                },
              },
            },
            400: {
              description: "Bad request",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      "/api/auth/login": {
        options: { tags: ["Auth"], responses: { 204: { description: "CORS preflight" } } },
        post: {
          tags: ["Auth"],
          summary: "Login (sets httpOnly session cookie and returns 7-day JWT token)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Logged in",
              headers: {
                "Set-Cookie": {
                  schema: { type: "string" },
                  description: "Session cookie",
                },
              },
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: { $ref: "#/components/schemas/User" },
                      token: {
                        type: "string",
                        description:
                          "JWT access token (Authorization: Bearer <token>). Expires in 7 days.",
                      },
                    },
                    required: ["user", "token"],
                  },
                },
              },
            },
            401: {
              description: "Unauthorized",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      "/api/auth/me": {
        options: { tags: ["Auth"], responses: { 204: { description: "CORS preflight" } } },
        get: {
          tags: ["Auth"],
          summary: "Get current user (requires session cookie)",
          security: [{ sessionCookie: [] }],
          responses: {
            200: {
              description: "Current user",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { user: { $ref: "#/components/schemas/User" } },
                    required: ["user"],
                  },
                },
              },
            },
            401: {
              description: "Not logged in",
              content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
            },
          },
        },
      },

      "/api/auth/logout": {
        options: { tags: ["Auth"], responses: { 204: { description: "CORS preflight" } } },
        post: {
          tags: ["Auth"],
          summary: "Logout (clears session cookie)",
          security: [{ sessionCookie: [] }],
          responses: {
            200: {
              description: "Logged out",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { ok: { type: "boolean" } },
                    required: ["ok"],
                  },
                },
              },
            },
          },
        },
      },
    },
  };
}


