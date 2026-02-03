# SKILL2: Backend API Generation from Database Schema

## Overview
This skill provides comprehensive instructions for transforming `migrate.js` and `import.js` files (outputs from SKILL1) into a fully functional Express.js RESTful API backend application with complete Swagger documentation.

## Prerequisites
- SKILL1 has been executed successfully
- `migrate.js` exists and contains complete database schema definitions
- `import.js` exists and contains data import logic
- PostgreSQL database is populated with data
- Node.js v14 or higher is installed

---

## Phase 1: Schema Analysis

### Step 1.1: Read and Analyze migrate.js
Read the `migrate.js` file to understand:
- All table names and their structures
- Primary keys and foreign key relationships
- Column names, data types, and constraints
- Indexes (especially full-text search indexes)
- Database views (if any)
- Naming conventions used

Create a mental model of:
- **Lookup tables**: Reference data (often ending in "Lookup" or containing codes)
- **Core data tables**: Main business entities
- **Relationship tables**: Many-to-many relationships
- **Detail/schedule tables**: Additional data linked to core tables

### Step 1.2: Read and Analyze import.js
Read the `import.js` file to understand:
- Data structure and format
- Relationships between tables
- Data transformation logic
- Field mappings and calculations
- Any business rules applied during import

### Step 1.3: Document Your Findings
Create a schema documentation summary including:
- List of all tables grouped by type (lookup, core, relationship)
- Primary and foreign key relationships
- Common query patterns (by ID, by category, search, etc.)
- Tables that should be joined in views

---

## Phase 2: Project Setup

### Step 2.1: Initialize Project Structure
```bash
npm init -y
```

Install required dependencies:
```bash
npm install express pg dotenv cors helmet morgan swagger-jsdoc swagger-ui-express
```

### Step 2.2: Create Directory Structure
```
project-root/
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
├── config/
│   ├── database.js
│   └── swagger.js
├── middleware/
│   ├── errorHandler.js
│   ├── logger.js
│   └── cors.js
├── routes/
│   ├── index.js
│   └── [one file per major entity or grouped endpoints]
├── controllers/
│   └── [one file per route file]
├── services/
│   └── [one file per controller]
└── utils/
    ├── queryBuilder.js
    ├── pagination.js
    └── responseFormatter.js
```

### Step 2.3: Create .env.example
```bash
# Database Connection
DB_CONNECTION_STRING=postgresql://username:password@localhost:5432/database_name

# Server Configuration
PORT=3000
NODE_ENV=development

# API Configuration
API_VERSION=v1
```

### Step 2.4: Create .gitignore
```
node_modules/
.env
*.log
.DS_Store
```

---

## Phase 3: Core Infrastructure

### Step 3.1: Database Connection (config/database.js)
```javascript
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_STRING,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

module.exports = pool;
```

### Step 3.2: Response Formatter (utils/responseFormatter.js)
```javascript
/**
 * Format successful API response
 */
exports.formatSuccessResponse = (data, metadata = {}) => {
  return {
    success: true,
    data,
    ...metadata
  };
};

/**
 * Format error API response
 */
exports.formatErrorResponse = (message, code = 'ERROR', details = {}) => {
  return {
    success: false,
    error: {
      message,
      code,
      ...details
    }
  };
};
```

### Step 3.3: Query Builder Utilities (utils/queryBuilder.js)
```javascript
/**
 * Build pagination query with LIMIT and OFFSET
 */
exports.buildPaginationQuery = (baseQuery, { page = 1, limit = 50, offset }) => {
  const actualLimit = Math.min(parseInt(limit) || 50, 1000);
  const actualOffset = offset !== undefined
    ? parseInt(offset)
    : (parseInt(page) - 1) * actualLimit;

  return {
    query: `${baseQuery} LIMIT $1 OFFSET $2`,
    params: [actualLimit, actualOffset],
    limit: actualLimit,
    offset: actualOffset
  };
};

/**
 * Build field selection clause
 */
exports.buildFieldSelection = (allowedFields, requestedFields) => {
  if (!requestedFields) return allowedFields.join(', ');

  const fields = requestedFields.split(',').map(f => f.trim());
  const validFields = fields.filter(f => allowedFields.includes(f));

  return validFields.length > 0 ? validFields.join(', ') : allowedFields.join(', ');
};

/**
 * Build ORDER BY clause
 */
exports.buildSortClause = (allowedFields, sortParam) => {
  if (!sortParam) return '';

  const isDescending = sortParam.startsWith('-');
  const field = isDescending ? sortParam.slice(1) : sortParam;

  if (!allowedFields.includes(field)) return '';

  return `ORDER BY ${field} ${isDescending ? 'DESC' : 'ASC'}`;
};

/**
 * Build full-text search WHERE clause
 */
exports.buildSearchQuery = (searchTerm, searchFields, paramIndex = 1) => {
  const searchConditions = searchFields.map(field =>
    `to_tsvector('english', ${field}) @@ plainto_tsquery('english', $${paramIndex})`
  ).join(' OR ');

  return `WHERE ${searchConditions}`;
};

/**
 * Build dynamic WHERE clause from filters
 */
exports.buildFilterClause = (filters, allowedFilters, startParamIndex = 1) => {
  const conditions = [];
  const params = [];
  let paramIndex = startParamIndex;

  for (const [key, value] of Object.entries(filters)) {
    if (allowedFilters[key] && value !== undefined && value !== null) {
      const filterConfig = allowedFilters[key];

      if (filterConfig.operator === 'LIKE') {
        conditions.push(`${filterConfig.column} ILIKE $${paramIndex}`);
        params.push(`%${value}%`);
      } else if (filterConfig.operator === 'IN' && Array.isArray(value)) {
        const placeholders = value.map((_, i) => `$${paramIndex + i}`).join(', ');
        conditions.push(`${filterConfig.column} IN (${placeholders})`);
        params.push(...value);
        paramIndex += value.length - 1;
      } else {
        const operator = filterConfig.operator || '=';
        conditions.push(`${filterConfig.column} ${operator} $${paramIndex}`);
        params.push(value);
      }
      paramIndex++;
    }
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    paramIndex
  };
};
```

### Step 3.4: Pagination Helper (utils/pagination.js)
```javascript
/**
 * Calculate pagination metadata
 */
exports.getPaginationMetadata = (total, page, limit, offset) => {
  const totalPages = Math.ceil(total / limit);
  const currentPage = offset !== undefined
    ? Math.floor(offset / limit) + 1
    : parseInt(page) || 1;

  return {
    page: currentPage,
    limit: parseInt(limit),
    total: parseInt(total),
    totalPages
  };
};
```

### Step 3.5: Error Handler Middleware (middleware/errorHandler.js)
```javascript
const { formatErrorResponse } = require('../utils/responseFormatter');

/**
 * 404 handler
 */
exports.notFoundHandler = (req, res, next) => {
  res.status(404).json(
    formatErrorResponse('Route not found', 'ROUTE_NOT_FOUND', { path: req.originalUrl })
  );
};

/**
 * Global error handler
 */
exports.globalErrorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json(
    formatErrorResponse(
      message,
      err.code || 'INTERNAL_ERROR',
      process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}
    )
  );
};
```

---

## Phase 4: Swagger Documentation Setup

### Step 4.1: Swagger Configuration (config/swagger.js)
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'RESTful API with auto-generated documentation from database schema',
      contact: {
        name: 'API Support'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api/${process.env.API_VERSION || 'v1'}`,
        description: 'Development server'
      }
    ],
    components: {
      schemas: {},
      parameters: {
        limitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', default: 50, maximum: 1000 },
          description: 'Number of records per page'
        },
        pageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', default: 1, minimum: 1 },
          description: 'Page number'
        },
        offsetParam: {
          in: 'query',
          name: 'offset',
          schema: { type: 'integer', default: 0, minimum: 0 },
          description: 'Number of records to skip'
        },
        sortParam: {
          in: 'query',
          name: 'sort',
          schema: { type: 'string' },
          description: 'Sort field (prefix with - for descending)'
        },
        fieldsParam: {
          in: 'query',
          name: 'fields',
          schema: { type: 'string' },
          description: 'Comma-separated list of fields to return'
        }
      },
      responses: {
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      code: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        BadRequest: {
          description: 'Invalid request parameters',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      code: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  error: {
                    type: 'object',
                    properties: {
                      message: { type: 'string' },
                      code: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
```

### Step 4.2: Swagger Route Setup
Add to your main router or server.js:
```javascript
const { swaggerUi, swaggerSpec } = require('./config/swagger');

// Swagger documentation routes
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
```

---

## Phase 5: Generate API Endpoints

### Step 5.1: Analyze Tables and Create Endpoint Plan

For each table in migrate.js, determine:
1. **Lookup tables**: Simple GET all and GET by ID
2. **Core tables**: Full CRUD or read-only with search, filters
3. **Relationship tables**: Nested routes under parent entities
4. **View tables**: Read-only endpoints for complex joins

### Step 5.2: Endpoint Naming Conventions
- Use plural nouns: `/api/v1/entities`
- Use kebab-case: `/api/v1/entity-details`
- Nested resources: `/api/v1/parents/:id/children`
- Search endpoints: `/api/v1/entities/search?q=term`
- Lookup endpoints group: `/api/v1/lookups/categories`

### Step 5.3: Standard Query Parameters
All list endpoints should support:
- `limit` (integer, default: 50, max: 1000)
- `offset` (integer, default: 0)
- `page` (integer, default: 1)
- `sort` (string, field name with optional `-` prefix)
- `fields` (string, comma-separated field names)

### Step 5.4: Create Services Layer

For each major entity or table group, create a service file:

**Example: services/entityService.js**
```javascript
const pool = require('../config/database');
const { buildPaginationQuery, buildFieldSelection, buildSortClause, buildFilterClause } = require('../utils/queryBuilder');

/**
 * Get all entities with filtering, sorting, and pagination
 */
exports.getAllEntities = async (filters = {}, options = {}) => {
  const { page, limit, offset, sort, fields } = options;

  // Define allowed fields and filters
  const allowedFields = ['id', 'name', 'category', 'created_at', 'updated_at'];
  const allowedFilters = {
    category: { column: 'category', operator: '=' },
    name: { column: 'name', operator: 'LIKE' },
    status: { column: 'status', operator: 'IN' }
  };

  const selectedFields = buildFieldSelection(allowedFields, fields);
  const { whereClause, params, paramIndex } = buildFilterClause(filters, allowedFilters);
  const sortClause = buildSortClause(allowedFields, sort);

  // Get total count
  const countQuery = `SELECT COUNT(*) FROM table_name ${whereClause}`;
  const countResult = await pool.query(countQuery, params);
  const total = parseInt(countResult.rows[0].count);

  // Build and execute main query
  const baseQuery = `
    SELECT ${selectedFields}
    FROM table_name
    ${whereClause}
    ${sortClause}
  `;

  const { query, params: paginationParams, limit: actualLimit, offset: actualOffset } =
    buildPaginationQuery(baseQuery, { page, limit, offset });

  const allParams = [...params, ...paginationParams];
  const result = await pool.query(query, allParams);

  return {
    data: result.rows,
    total,
    limit: actualLimit,
    offset: actualOffset
  };
};

/**
 * Get entity by ID
 */
exports.getEntityById = async (id) => {
  const query = 'SELECT * FROM table_name WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

/**
 * Search entities by text
 */
exports.searchEntities = async (searchTerm, options = {}) => {
  const { page, limit } = options;
  const searchFields = ['name', 'description'];

  const searchQuery = `
    SELECT id, name, description
    FROM table_name
    WHERE ${searchFields.map((field, i) =>
      `to_tsvector('english', ${field}) @@ plainto_tsquery('english', $1)`
    ).join(' OR ')}
  `;

  const { query, params } = buildPaginationQuery(searchQuery, { page, limit });
  const result = await pool.query(query, [searchTerm, ...params]);

  return result.rows;
};
```

### Step 5.5: Create Controllers

For each service, create a corresponding controller:

**Example: controllers/entityController.js**
```javascript
const entityService = require('../services/entityService');
const { formatSuccessResponse, formatErrorResponse } = require('../utils/responseFormatter');
const { getPaginationMetadata } = require('../utils/pagination');

/**
 * @swagger
 * /entities:
 *   get:
 *     summary: Get all entities
 *     tags: [Entities]
 *     parameters:
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/sortParam'
 *       - $ref: '#/components/parameters/fieldsParam'
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: List of entities
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page: { type: integer }
 *                     limit: { type: integer }
 *                     total: { type: integer }
 *                     totalPages: { type: integer }
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
exports.getAllEntities = async (req, res, next) => {
  try {
    const { page, limit, offset, sort, fields, category, name, status } = req.query;

    const filters = { category, name, status };
    const options = { page, limit, offset, sort, fields };

    const result = await entityService.getAllEntities(filters, options);

    res.json(formatSuccessResponse(result.data, {
      count: result.data.length,
      pagination: getPaginationMetadata(result.total, page, result.limit, result.offset)
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /entities/{id}:
 *   get:
 *     summary: Get entity by ID
 *     tags: [Entities]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Entity ID
 *     responses:
 *       200:
 *         description: Entity details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: object }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
exports.getEntityById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const entity = await entityService.getEntityById(id);

    if (!entity) {
      return res.status(404).json(
        formatErrorResponse('Entity not found', 'ENTITY_NOT_FOUND')
      );
    }

    res.json(formatSuccessResponse(entity));
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /entities/search:
 *   get:
 *     summary: Search entities
 *     tags: [Entities]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/pageParam'
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { type: array }
 *                 count: { type: integer }
 *                 searchTerm: { type: string }
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
exports.searchEntities = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;

    if (!q) {
      return res.status(400).json(
        formatErrorResponse('Search query required', 'MISSING_QUERY')
      );
    }

    const results = await entityService.searchEntities(q, { page, limit });

    res.json(formatSuccessResponse(results, {
      count: results.length,
      searchTerm: q
    }));
  } catch (error) {
    next(error);
  }
};
```

### Step 5.6: Create Routes

For each controller, create route definitions:

**Example: routes/entities.js**
```javascript
const express = require('express');
const router = express.Router();
const entityController = require('../controllers/entityController');

/**
 * @swagger
 * tags:
 *   name: Entities
 *   description: Entity management endpoints
 */

// List and search routes come before parameterized routes
router.get('/search', entityController.searchEntities);
router.get('/', entityController.getAllEntities);
router.get('/:id', entityController.getEntityById);

// Nested resource routes
router.get('/:id/related', entityController.getRelatedEntities);

module.exports = router;
```

### Step 5.7: Main Routes Index (routes/index.js)
```javascript
const express = require('express');
const router = express.Router();

// Import all route modules
const lookupRoutes = require('./lookups');
const entityRoutes = require('./entities');
const utilityRoutes = require('./utility');

// Register routes
router.use('/lookups', lookupRoutes);
router.use('/entities', entityRoutes);
router.use('/', utilityRoutes);

module.exports = router;
```

---

## Phase 6: Main Server Implementation

### Step 6.1: Create server.js
```javascript
require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const pool = require('./config/database');
const { swaggerUi, swaggerSpec } = require('./config/swagger');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;
const API_VERSION = process.env.API_VERSION || 'v1';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS configuration (permissive for development)
app.use(cors({
  origin: '*',
  methods: ['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// Logging middleware
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from /public directory if it exists
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  index: false
}));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Documentation',
  customCss: '.swagger-ui .topbar { display: none }'
}));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API routes
app.use(`/api/${API_VERSION}`, require('./routes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Server',
    version: '1.0.0',
    documentation: '/api-docs',
    apiDocs: '/api-docs.json',
    endpoints: {
      health: `/api/${API_VERSION}/health`,
      stats: `/api/${API_VERSION}/stats`
    }
  });
});

// Fallback to index.html for SPA routes
app.get('/*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api')) {
    return next();
  }

  const indexPath = path.join(publicPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      next();
    }
  });
});

// Error handling
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`API Base URL: http://localhost:${PORT}/api/${API_VERSION}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`API Docs JSON: http://localhost:${PORT}/api-docs.json`);
});

module.exports = app;
```

---

## Phase 7: Utility Endpoints

### Step 7.1: Health Check Controller
```javascript
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Service health status
 */
exports.healthCheck = async (req, res, next) => {
  try {
    const dbCheck = await pool.query('SELECT NOW()');

    res.json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbCheck.rows ? 'connected' : 'disconnected',
        uptime: process.uptime()
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### Step 7.2: Database Stats Controller
```javascript
/**
 * @swagger
 * /stats:
 *   get:
 *     summary: Get database statistics
 *     tags: [Utility]
 *     responses:
 *       200:
 *         description: Database statistics
 */
exports.getDatabaseStats = async (req, res, next) => {
  try {
    // Get all table names from migrate.js structure
    const tables = []; // Parse from migrate.js or query information_schema

    const stats = {};
    for (const table of tables) {
      const result = await pool.query(`SELECT COUNT(*) FROM ${table}`);
      stats[table] = parseInt(result.rows[0].count);
    }

    res.json({
      success: true,
      data: {
        tables: stats,
        totalRecords: Object.values(stats).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    next(error);
  }
};
```

---

## Phase 8: Implementation Patterns

### Pattern 1: Lookup Table Endpoints
Lookup tables typically need:
- GET all (no pagination needed, usually small)
- GET by code/ID

```javascript
// Service
exports.getAllCategories = async () => {
  const query = 'SELECT * FROM category_lookup ORDER BY code';
  const result = await pool.query(query);
  return result.rows;
};

exports.getCategoryByCode = async (code) => {
  const query = 'SELECT * FROM category_lookup WHERE code = $1';
  const result = await pool.query(query, [code]);
  return result.rows[0];
};
```

### Pattern 2: Core Entity with Relationships
Main entities need:
- GET all with filters and pagination
- GET by ID
- Search (if text fields exist)
- GET related entities (nested routes)

```javascript
// Get entity with related data
exports.getEntityWithRelations = async (id) => {
  const entityQuery = 'SELECT * FROM main_table WHERE id = $1';
  const relatedQuery = 'SELECT * FROM related_table WHERE main_id = $1';

  const [entity, related] = await Promise.all([
    pool.query(entityQuery, [id]),
    pool.query(relatedQuery, [id])
  ]);

  return {
    ...entity.rows[0],
    related: related.rows
  };
};
```

### Pattern 3: Time Series Data
Tables with fiscal periods or timestamps:

```javascript
exports.getEntityHistory = async (id, options = {}) => {
  const { startDate, endDate, sort = '-date' } = options;

  const conditions = ['entity_id = $1'];
  const params = [id];

  if (startDate) {
    conditions.push(`date >= $${params.length + 1}`);
    params.push(startDate);
  }

  if (endDate) {
    conditions.push(`date <= $${params.length + 1}`);
    params.push(endDate);
  }

  const query = `
    SELECT * FROM time_series_table
    WHERE ${conditions.join(' AND ')}
    ORDER BY date ${sort.startsWith('-') ? 'DESC' : 'ASC'}
  `;

  const result = await pool.query(query, params);
  return result.rows;
};
```

### Pattern 4: Aggregation Endpoints
Financial summaries and statistics:

```javascript
/**
 * @swagger
 * /entities/{id}/summary:
 *   get:
 *     summary: Get aggregated summary for entity
 */
exports.getEntitySummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        COUNT(*) as total_records,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        MAX(date) as latest_date,
        MIN(date) as earliest_date
      FROM transactions
      WHERE entity_id = $1
    `;

    const result = await pool.query(query, [id]);
    res.json(formatSuccessResponse(result.rows[0]));
  } catch (error) {
    next(error);
  }
};
```

---

## Phase 9: Testing

### Step 9.1: Manual Testing Checklist
- [ ] Server starts without errors
- [ ] Database connection established
- [ ] /api-docs loads and displays all endpoints
- [ ] /api-docs.json returns valid OpenAPI spec
- [ ] Root endpoint (/) returns API information
- [ ] Health check endpoint works
- [ ] Stats endpoint returns data
- [ ] All GET endpoints return data
- [ ] Pagination works (limit, offset, page)
- [ ] Sorting works (ascending and descending)
- [ ] Field selection works
- [ ] Filters work correctly
- [ ] Search endpoints return relevant results
- [ ] Nested routes work
- [ ] 404 errors return proper format
- [ ] 500 errors return proper format
- [ ] CORS headers present in responses

### Step 9.2: Test with curl
```bash
# Health check
curl http://localhost:3000/api/v1/health

# Get all entities (paginated)
curl "http://localhost:3000/api/v1/entities?limit=10&page=1"

# Get specific entity
curl http://localhost:3000/api/v1/entities/123

# Search
curl "http://localhost:3000/api/v1/entities/search?q=test"

# With filters and sorting
curl "http://localhost:3000/api/v1/entities?category=A&sort=-created_at&limit=20"

# Field selection
curl "http://localhost:3000/api/v1/entities?fields=id,name,category"

# Nested resources
curl http://localhost:3000/api/v1/entities/123/related

# API documentation
curl http://localhost:3000/api-docs.json
```

### Step 9.3: Browser Testing
1. Navigate to `http://localhost:3000`
2. Navigate to `http://localhost:3000/api-docs`
3. Test each endpoint through Swagger UI
4. Verify response formats
5. Test error cases (invalid IDs, missing parameters)

---

## Phase 10: Documentation

### Step 10.1: Create README.md
```markdown
# API Server

Auto-generated RESTful API from database schema.

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. Start server:
   ```bash
   npm start
   ```

4. Access API documentation:
   ```
   http://localhost:3000/api-docs
   ```

## API Documentation

- Interactive docs: http://localhost:3000/api-docs
- OpenAPI spec: http://localhost:3000/api-docs.json
- Health check: http://localhost:3000/api/v1/health
- Database stats: http://localhost:3000/api/v1/stats

## Query Parameters

All list endpoints support:
- `limit` - Records per page (max 1000)
- `page` - Page number
- `offset` - Records to skip
- `sort` - Sort field (prefix with `-` for descending)
- `fields` - Comma-separated fields to return

## Response Format

Success:
```json
{
  "success": true,
  "data": [...],
  "count": 50,
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "totalPages": 20
  }
}
```

Error:
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Environment Variables

- `DB_CONNECTION_STRING` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `API_VERSION` - API version (default: v1)
```

### Step 10.2: Add package.json Scripts
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "echo \"Run your tests here\""
  }
}
```

---

## Best Practices

### Code Organization
1. Keep services focused on database operations
2. Keep controllers focused on request/response handling
3. Use consistent naming conventions
4. Group related endpoints in the same route file
5. Reuse utility functions across controllers

### Error Handling
1. Always use try-catch in async functions
2. Pass errors to next() middleware
3. Return appropriate HTTP status codes
4. Include error codes for client handling
5. Log errors with sufficient context

### Performance
1. Use indexes for filtered and sorted fields
2. Implement pagination for all list endpoints
3. Limit maximum page size (1000 recommended)
4. Use field selection to reduce payload size
5. Consider connection pooling settings

### Security
1. Validate and sanitize all user inputs
2. Use parameterized queries (never string concatenation)
3. Set appropriate CORS policies
4. Use helmet for security headers
5. Rate limit API endpoints in production

### Documentation
1. Add Swagger comments to all endpoints
2. Document all query parameters
3. Provide example requests and responses
4. Keep README.md up to date
5. Document any business logic or calculations

---

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check connection string format
- Ensure database exists and is accessible
- Check network/firewall settings

### Swagger Documentation Not Showing
- Verify JSDoc comments are properly formatted
- Check `apis` path in swagger config
- Ensure route files are in correct location
- Check console for swagger-jsdoc errors

### Slow Query Performance
- Add indexes for frequently filtered fields
- Use EXPLAIN ANALYZE to identify bottlenecks
- Consider materialized views for complex queries
- Implement caching for lookup tables

### CORS Errors
- Verify CORS middleware is before routes
- Check origin configuration
- Ensure preflight OPTIONS requests are handled

---

## Summary Checklist

- [ ] migrate.js and import.js analyzed
- [ ] Project structure created
- [ ] Database connection configured
- [ ] Utility functions implemented
- [ ] Swagger configuration complete
- [ ] All tables have corresponding endpoints
- [ ] Controllers have Swagger JSDoc comments
- [ ] Routes properly organized
- [ ] server.js configured with all middleware
- [ ] /api-docs route working
- [ ] /api-docs.json route working
- [ ] Health and stats endpoints implemented
- [ ] All endpoints tested manually
- [ ] README.md created
- [ ] .env.example provided
- [ ] Error handling working correctly

---

**End of SKILL2: Backend API Generation**
