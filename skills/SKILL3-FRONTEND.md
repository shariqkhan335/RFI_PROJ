# SKILL3: Frontend Application Generation from API Backend

## Overview
This skill provides comprehensive instructions for creating a single-page Vue.js CDN application that consumes the API backend created in SKILL2. The application will be fully contained in `/public/index.html` for easy testing and deployment.

## Prerequisites
- SKILL2 has been completed successfully
- Backend API server is running
- API documentation is available at /api-docs
- All API endpoints are tested and working

---

## Phase 1: API Analysis

### Step 1.1: Review API Documentation
1. Open `http://localhost:3000/api-docs` in browser
2. Review all available endpoints
3. Note the data structure of responses
4. Identify main entities and their relationships
5. Document available filters and query parameters

### Step 1.2: Plan UI Components
Based on API structure, plan:
- **Navigation**: Main sections (one per major entity group)
- **List Views**: Tables for displaying collections
- **Detail Views**: Cards for individual records
- **Search**: Global or per-entity search
- **Filters**: Dropdowns, inputs for query parameters
- **Pagination**: Controls for navigating pages

### Step 1.3: Identify Key Features
Determine which features to implement:
- Entity browsing with pagination
- Search functionality
- Filtering by categories/types
- Sorting by different fields
- Detail view with related data
- Data export capabilities (future)
- Real-time updates (future)

---

## Phase 2: Create Base HTML Structure

### Step 2.1: Create /public/index.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>API Data Explorer</title>

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Tailwind Config for Dark Mode -->
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            primary: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8',
              800: '#1e40af',
              900: '#1e3a8a',
            }
          }
        }
      }
    }
  </script>

  <!-- Vue 3 CDN -->
  <script src="https://unpkg.com/vue@3/dist/vue.global.js"></script>

  <!-- Axios CDN -->
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

  <!-- Custom Styles -->
  <style>
    [v-cloak] {
      display: none;
    }

    .fade-enter-active, .fade-leave-active {
      transition: opacity 0.3s ease;
    }

    .fade-enter-from, .fade-leave-to {
      opacity: 0;
    }

    .slide-enter-active, .slide-leave-active {
      transition: all 0.3s ease;
    }

    .slide-enter-from {
      transform: translateX(-100%);
    }

    .slide-leave-to {
      transform: translateX(100%);
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    ::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .dark ::-webkit-scrollbar-track {
      background: #1e293b;
    }

    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 4px;
    }

    .dark ::-webkit-scrollbar-thumb {
      background: #475569;
    }

    ::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    /* Loading spinner */
    .spinner {
      border: 3px solid #f3f4f6;
      border-top: 3px solid #3b82f6;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive table */
    @media (max-width: 768px) {
      .responsive-table {
        display: block;
        overflow-x: auto;
        white-space: nowrap;
      }
    }
  </style>
</head>
<body class="bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
  <div id="app" v-cloak>
    <!-- Application content will go here -->
  </div>

  <!-- Vue Application Script -->
  <script>
    // Application code will go here
  </script>
</body>
</html>
```

---

## Phase 3: Vue Application Structure

### Step 3.1: Initialize Vue App

```javascript
const { createApp } = Vue;

createApp({
  data() {
    return {
      // App state
      apiBaseUrl: '/api/v1',
      isDarkMode: localStorage.getItem('darkMode') === 'true',

      // Navigation
      currentView: 'home',
      currentEntity: null,

      // Data state
      entities: [],
      selectedItem: null,
      lookups: {},

      // UI state
      loading: false,
      error: null,

      // Pagination
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0
      },

      // Filters
      filters: {
        search: '',
        category: '',
        sort: '',
        fields: ''
      },

      // Search
      searchQuery: '',
      searchResults: [],

      // Stats
      stats: null,
      health: null
    };
  },

  computed: {
    // Computed properties
    darkModeClass() {
      return this.isDarkMode ? 'dark' : '';
    },

    hasResults() {
      return this.entities && this.entities.length > 0;
    },

    paginationPages() {
      const pages = [];
      const current = this.pagination.page;
      const total = this.pagination.totalPages;

      // Show max 7 page numbers
      let start = Math.max(1, current - 3);
      let end = Math.min(total, current + 3);

      if (end - start < 6) {
        if (start === 1) {
          end = Math.min(total, start + 6);
        } else {
          start = Math.max(1, end - 6);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      return pages;
    }
  },

  methods: {
    // Methods will be added here
  },

  mounted() {
    // Initialize app
    this.init();
  }
}).mount('#app');
```

### Step 3.2: Core Methods

Add these methods to the Vue app:

```javascript
methods: {
  // Initialize application
  async init() {
    this.applyDarkMode();
    await this.loadHealth();
    await this.loadStats();
    await this.loadLookups();
    this.currentView = 'home';
  },

  // Dark mode toggle
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('darkMode', this.isDarkMode);
    this.applyDarkMode();
  },

  applyDarkMode() {
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  // API calls
  async apiCall(endpoint, params = {}) {
    try {
      this.loading = true;
      this.error = null;

      const response = await axios.get(`${this.apiBaseUrl}${endpoint}`, {
        params
      });

      return response.data;
    } catch (error) {
      this.error = error.response?.data?.error?.message || error.message;
      console.error('API Error:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  },

  // Load health status
  async loadHealth() {
    try {
      const data = await this.apiCall('/health');
      this.health = data.data;
    } catch (error) {
      console.error('Failed to load health:', error);
    }
  },

  // Load database stats
  async loadStats() {
    try {
      const data = await this.apiCall('/stats');
      this.stats = data.data;
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  },

  // Load lookup data (categories, types, etc.)
  async loadLookups() {
    try {
      // Load all lookup tables from API
      // Example: const categories = await this.apiCall('/lookups/categories');
      // this.lookups.categories = categories.data;

      // Repeat for each lookup table identified in API docs
    } catch (error) {
      console.error('Failed to load lookups:', error);
    }
  },

  // Load entities with filters and pagination
  async loadEntities(entityType, resetPage = false) {
    if (resetPage) {
      this.pagination.page = 1;
    }

    try {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.limit,
        ...this.filters
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null) {
          delete params[key];
        }
      });

      const data = await this.apiCall(`/${entityType}`, params);

      this.entities = data.data;
      if (data.pagination) {
        this.pagination = { ...this.pagination, ...data.pagination };
      }

      this.currentEntity = entityType;
    } catch (error) {
      console.error('Failed to load entities:', error);
    }
  },

  // Load single item details
  async loadItemDetails(entityType, id) {
    try {
      const data = await this.apiCall(`/${entityType}/${id}`);
      this.selectedItem = data.data;
      this.currentView = 'detail';
    } catch (error) {
      console.error('Failed to load item details:', error);
    }
  },

  // Search
  async performSearch(entityType) {
    if (!this.searchQuery.trim()) {
      return;
    }

    try {
      const data = await this.apiCall(`/${entityType}/search`, {
        q: this.searchQuery,
        limit: this.pagination.limit
      });

      this.searchResults = data.data;
      this.currentView = 'search-results';
    } catch (error) {
      console.error('Search failed:', error);
    }
  },

  // Pagination
  goToPage(page) {
    if (page < 1 || page > this.pagination.totalPages) {
      return;
    }
    this.pagination.page = page;
    this.loadEntities(this.currentEntity);
  },

  nextPage() {
    this.goToPage(this.pagination.page + 1);
  },

  prevPage() {
    this.goToPage(this.pagination.page - 1);
  },

  // Filters
  applyFilters() {
    this.loadEntities(this.currentEntity, true);
  },

  clearFilters() {
    this.filters = {
      search: '',
      category: '',
      sort: '',
      fields: ''
    };
    this.searchQuery = '';
    this.loadEntities(this.currentEntity, true);
  },

  // Sorting
  sortBy(field) {
    const currentSort = this.filters.sort;

    if (currentSort === field) {
      this.filters.sort = `-${field}`;
    } else if (currentSort === `-${field}`) {
      this.filters.sort = '';
    } else {
      this.filters.sort = field;
    }

    this.applyFilters();
  },

  getSortIcon(field) {
    const currentSort = this.filters.sort;
    if (currentSort === field) {
      return '↑';
    } else if (currentSort === `-${field}`) {
      return '↓';
    }
    return '↕';
  },

  // Navigation
  navigateTo(view, data = null) {
    this.currentView = view;
    if (data) {
      this.currentEntity = data;
    }
  },

  // Utility functions
  formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  },

  formatNumber(number) {
    if (number === null || number === undefined) return 'N/A';
    return new Intl.NumberFormat().format(number);
  },

  formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  },

  truncate(text, length = 100) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
}
```

---

## Phase 4: UI Components

### Step 4.1: App Container Template

Add to `<div id="app">`:

```html
<!-- Header -->
<header class="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-50">
  <div class="container mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <!-- Logo/Title -->
      <div class="flex items-center space-x-4">
        <button @click="navigateTo('home')"
                class="text-2xl font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition">
          📊 Data Explorer
        </button>

        <!-- Health indicator -->
        <div v-if="health" class="hidden md:flex items-center space-x-2">
          <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ health.status }}
          </span>
        </div>
      </div>

      <!-- Dark mode toggle -->
      <button @click="toggleDarkMode"
              class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
        <span v-if="isDarkMode" class="text-xl">☀️</span>
        <span v-else class="text-xl">🌙</span>
      </button>
    </div>
  </div>
</header>

<!-- Main Content -->
<main class="container mx-auto px-4 py-8">
  <!-- Loading Overlay -->
  <div v-if="loading" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
      <div class="spinner mx-auto"></div>
      <p class="mt-4 text-gray-700 dark:text-gray-300">Loading...</p>
    </div>
  </div>

  <!-- Error Alert -->
  <div v-if="error"
       class="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded relative"
       role="alert">
    <strong class="font-bold">Error:</strong>
    <span class="block sm:inline">{{ error }}</span>
    <button @click="error = null" class="absolute top-0 bottom-0 right-0 px-4 py-3">
      <span class="text-2xl">&times;</span>
    </button>
  </div>

  <!-- Home View -->
  <div v-if="currentView === 'home'">
    <!-- Home content component -->
  </div>

  <!-- List View -->
  <div v-if="currentView === 'list'">
    <!-- List content component -->
  </div>

  <!-- Detail View -->
  <div v-if="currentView === 'detail'">
    <!-- Detail content component -->
  </div>

  <!-- Search Results View -->
  <div v-if="currentView === 'search-results'">
    <!-- Search results component -->
  </div>
</main>

<!-- Footer -->
<footer class="bg-white dark:bg-gray-800 shadow-lg mt-12">
  <div class="container mx-auto px-4 py-6">
    <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div class="text-gray-600 dark:text-gray-400 text-sm">
        <p>API Data Explorer v1.0.0</p>
        <p v-if="stats" class="mt-1">
          Total Records: {{ formatNumber(stats.totalRecords) }}
        </p>
      </div>

      <div class="flex space-x-4">
        <a href="/api-docs" target="_blank"
           class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm transition">
          📖 API Docs
        </a>
        <a href="/api-docs.json" target="_blank"
           class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm transition">
          📄 OpenAPI Spec
        </a>
      </div>
    </div>
  </div>
</footer>
```

### Step 4.2: Home View Component

```html
<div v-if="currentView === 'home'" class="space-y-8">
  <!-- Hero Section -->
  <div class="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-xl p-8 text-white">
    <h1 class="text-4xl font-bold mb-4">Welcome to Data Explorer</h1>
    <p class="text-xl opacity-90">Explore and analyze your data with powerful filtering and search capabilities</p>
  </div>

  <!-- Stats Cards -->
  <div v-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    <div v-for="(count, table) in stats.tables" :key="table"
         @click="loadEntities(table); navigateTo('list')"
         class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-gray-600 dark:text-gray-400 text-sm font-medium uppercase tracking-wide">
            {{ table.replace(/_/g, ' ') }}
          </p>
          <p class="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
            {{ formatNumber(count) }}
          </p>
        </div>
        <div class="text-4xl opacity-50">
          📊
        </div>
      </div>
      <button class="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded transition">
        Explore
      </button>
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <button @click="navigateTo('list', 'entities'); loadEntities('entities')"
              class="p-4 border-2 border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition text-left">
        <div class="text-2xl mb-2">🔍</div>
        <div class="font-semibold text-gray-800 dark:text-white">Browse All</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">View all records</div>
      </button>

      <button @click="currentView = 'search'"
              class="p-4 border-2 border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition text-left">
        <div class="text-2xl mb-2">🔎</div>
        <div class="font-semibold text-gray-800 dark:text-white">Search</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">Find specific records</div>
      </button>

      <a href="/api-docs" target="_blank"
         class="p-4 border-2 border-primary-300 dark:border-primary-700 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900 transition text-left">
        <div class="text-2xl mb-2">📖</div>
        <div class="font-semibold text-gray-800 dark:text-white">API Docs</div>
        <div class="text-sm text-gray-600 dark:text-gray-400">View API documentation</div>
      </a>
    </div>
  </div>
</div>
```

### Step 4.3: List View Component

```html
<div v-if="currentView === 'list'" class="space-y-6">
  <!-- Header with Search and Filters -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
      <div>
        <button @click="navigateTo('home')"
                class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-2 text-sm">
          ← Back to Home
        </button>
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white capitalize">
          {{ currentEntity.replace(/_/g, ' ') }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ pagination.total }} total records
        </p>
      </div>

      <!-- Search Bar -->
      <div class="flex-1 lg:max-w-md">
        <div class="relative">
          <input v-model="searchQuery"
                 @keyup.enter="performSearch(currentEntity)"
                 type="text"
                 placeholder="Search..."
                 class="w-full px-4 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
          <button @click="performSearch(currentEntity)"
                  class="absolute right-2 top-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            🔍
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Row -->
    <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
      <!-- Category Filter (if applicable) -->
      <div v-if="lookups.categories">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <select v-model="filters.category"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
          <option value="">All Categories</option>
          <option v-for="cat in lookups.categories" :key="cat.code" :value="cat.code">
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Sort -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Sort By
        </label>
        <select v-model="filters.sort"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
          <option value="">Default</option>
          <option value="name">Name (A-Z)</option>
          <option value="-name">Name (Z-A)</option>
          <option value="created_at">Oldest First</option>
          <option value="-created_at">Newest First</option>
        </select>
      </div>

      <!-- Per Page -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Per Page
        </label>
        <select v-model.number="pagination.limit"
                @change="applyFilters"
                class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
          <option :value="25">25</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="250">250</option>
        </select>
      </div>

      <!-- Clear Filters -->
      <div class="flex items-end">
        <button @click="clearFilters"
                class="w-full px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition">
          Clear Filters
        </button>
      </div>
    </div>
  </div>

  <!-- Data Table -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <div class="overflow-x-auto responsive-table">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <!-- Dynamic headers based on entity type -->
            <!-- Example for generic entity -->
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="sortBy('id')">
              ID {{ getSortIcon('id') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                @click="sortBy('name')">
              Name {{ getSortIcon('name') }}
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Details
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="entity in entities"
              :key="entity.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {{ entity.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
              {{ entity.name || 'N/A' }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
              {{ truncate(entity.description || '', 50) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button @click="loadItemDetails(currentEntity, entity.id)"
                      class="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 transition">
                View Details →
              </button>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="!hasResults">
            <td colspan="4" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
              <div class="text-6xl mb-4">📭</div>
              <p class="text-lg">No records found</p>
              <p class="text-sm mt-2">Try adjusting your filters or search query</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Pagination -->
  <div v-if="pagination.totalPages > 1"
       class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
    <div class="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
      <div class="text-sm text-gray-700 dark:text-gray-300">
        Showing {{ ((pagination.page - 1) * pagination.limit) + 1 }}
        to {{ Math.min(pagination.page * pagination.limit, pagination.total) }}
        of {{ formatNumber(pagination.total) }} results
      </div>

      <div class="flex items-center space-x-2">
        <!-- Previous button -->
        <button @click="prevPage"
                :disabled="pagination.page === 1"
                :class="{ 'opacity-50 cursor-not-allowed': pagination.page === 1 }"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300">
          ← Prev
        </button>

        <!-- Page numbers -->
        <button v-for="page in paginationPages"
                :key="page"
                @click="goToPage(page)"
                :class="{
                  'bg-primary-600 text-white': page === pagination.page,
                  'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700': page !== pagination.page
                }"
                class="px-4 py-2 border rounded-lg transition">
          {{ page }}
        </button>

        <!-- Next button -->
        <button @click="nextPage"
                :disabled="pagination.page === pagination.totalPages"
                :class="{ 'opacity-50 cursor-not-allowed': pagination.page === pagination.totalPages }"
                class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300">
          Next →
        </button>
      </div>
    </div>
  </div>
</div>
```

### Step 4.4: Detail View Component

```html
<div v-if="currentView === 'detail' && selectedItem" class="space-y-6">
  <!-- Header -->
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <button @click="navigateTo('list'); loadEntities(currentEntity)"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 mb-4 text-sm">
      ← Back to List
    </button>

    <div class="flex flex-col lg:flex-row lg:items-start lg:justify-between">
      <div class="flex-1">
        <h2 class="text-3xl font-bold text-gray-800 dark:text-white">
          {{ selectedItem.name || selectedItem.title || 'Details' }}
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          ID: {{ selectedItem.id }}
        </p>
      </div>

      <div class="mt-4 lg:mt-0">
        <button class="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition">
          Export
        </button>
      </div>
    </div>
  </div>

  <!-- Details Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Basic Information -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h3 class="text-xl font-bold text-gray-800 dark:text-white mb-4">Basic Information</h3>

      <dl class="space-y-3">
        <div v-for="(value, key) in selectedItem" :key="key"
             v-if="!Array.isArray(value) && typeof value !== 'object'"
             class="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-2">
          <dt class="font-medium text-gray-600 dark:text-gray-400 capitalize">
            {{ key.replace(/_/g, ' ') }}:
          </dt>
          <dd class="text-gray-900 dark:text-white text-right ml-4">
            {{ value || 'N/A' }}
          </dd>
        </div>
      </dl>
    </div>

    <!-- Additional sections for related data -->
    <!-- This would be customized based on your specific entity structure -->
  </div>
</div>
```

---

## Phase 5: Mobile Responsiveness

### Step 5.1: Mobile Navigation Menu

Add mobile menu toggle:

```html
<div class="lg:hidden">
  <button @click="mobileMenuOpen = !mobileMenuOpen"
          class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
    </svg>
  </button>
</div>

<!-- Mobile Menu Overlay -->
<transition name="fade">
  <div v-if="mobileMenuOpen"
       @click="mobileMenuOpen = false"
       class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"></div>
</transition>

<!-- Mobile Menu Drawer -->
<transition name="slide">
  <div v-if="mobileMenuOpen"
       class="fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl z-50 lg:hidden overflow-y-auto">
    <!-- Menu content -->
  </div>
</transition>
```

### Step 5.2: Responsive Table Alternative

For mobile, convert table to cards:

```html
<!-- Mobile Card View (shown on small screens) -->
<div class="lg:hidden space-y-4">
  <div v-for="entity in entities"
       :key="entity.id"
       class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
    <div class="flex justify-between items-start mb-3">
      <h4 class="font-semibold text-gray-900 dark:text-white">
        {{ entity.name || 'N/A' }}
      </h4>
      <span class="text-xs text-gray-500 dark:text-gray-400">
        #{{ entity.id }}
      </span>
    </div>

    <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
      {{ truncate(entity.description || '', 80) }}
    </p>

    <button @click="loadItemDetails(currentEntity, entity.id)"
            class="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition">
      View Details
    </button>
  </div>
</div>

<!-- Desktop Table View (shown on large screens) -->
<div class="hidden lg:block">
  <!-- Regular table here -->
</div>
```

---

## Phase 6: Advanced Features

### Step 6.1: Export Functionality

```javascript
methods: {
  exportToCSV() {
    if (!this.entities || this.entities.length === 0) {
      return;
    }

    // Get headers
    const headers = Object.keys(this.entities[0]);

    // Create CSV content
    let csv = headers.join(',') + '\n';

    this.entities.forEach(entity => {
      const row = headers.map(header => {
        const value = entity[header];
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csv += row.join(',') + '\n';
    });

    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentEntity}_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },

  exportToJSON() {
    if (!this.entities || this.entities.length === 0) {
      return;
    }

    const json = JSON.stringify(this.entities, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.currentEntity}_${Date.now()}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  }
}
```

### Step 6.2: Advanced Filtering UI

```html
<!-- Advanced Filter Panel -->
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mt-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-semibold text-gray-800 dark:text-white">Advanced Filters</h3>
    <button @click="showAdvancedFilters = !showAdvancedFilters"
            class="text-primary-600 dark:text-primary-400 hover:text-primary-700">
      {{ showAdvancedFilters ? 'Hide' : 'Show' }}
    </button>
  </div>

  <transition name="fade">
    <div v-if="showAdvancedFilters" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Date range filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date From
        </label>
        <input v-model="filters.dateFrom"
               type="date"
               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Date To
        </label>
        <input v-model="filters.dateTo"
               type="date"
               class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
      </div>

      <!-- Numeric range filter -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Amount Range
        </label>
        <div class="flex space-x-2">
          <input v-model.number="filters.amountMin"
                 type="number"
                 placeholder="Min"
                 class="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
          <input v-model.number="filters.amountMax"
                 type="number"
                 placeholder="Max"
                 class="w-1/2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white">
        </div>
      </div>
    </div>
  </transition>
</div>
```

### Step 6.3: Data Visualization (Basic Charts)

```html
<!-- Stats Summary Cards with Visual Indicators -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-gray-600 dark:text-gray-400 text-sm">Total Records</p>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-2">
          {{ formatNumber(pagination.total) }}
        </p>
      </div>
      <div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
        <span class="text-2xl">📊</span>
      </div>
    </div>

    <!-- Simple bar indicator -->
    <div class="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div class="h-full bg-primary-600 rounded-full"
           :style="{ width: '75%' }"></div>
    </div>
  </div>

  <!-- Additional stat cards... -->
</div>
```

---

## Phase 7: Testing and Optimization

### Step 7.1: Testing Checklist

- [ ] Dark mode toggle works correctly
- [ ] All API endpoints load data successfully
- [ ] Pagination works (next, prev, page numbers)
- [ ] Sorting works (ascending, descending)
- [ ] Filtering works (all filter types)
- [ ] Search returns relevant results
- [ ] Detail view loads complete data
- [ ] Mobile responsive design works
- [ ] Error messages display correctly
- [ ] Loading states show during API calls
- [ ] Export functionality works (if implemented)
- [ ] Browser back/forward buttons work
- [ ] Application works on Chrome, Firefox, Safari
- [ ] Application works on mobile devices
- [ ] No console errors

### Step 7.2: Performance Optimization

```javascript
// Debounce search input
methods: {
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
},

created() {
  // Debounced search
  this.debouncedSearch = this.debounce((query) => {
    this.performSearch(this.currentEntity);
  }, 500);
}
```

### Step 7.3: Local Storage Caching

```javascript
methods: {
  // Cache lookup data in localStorage
  async loadLookups() {
    const cached = localStorage.getItem('lookups');
    const cacheTime = localStorage.getItem('lookups_time');

    // Use cache if less than 1 hour old
    if (cached && cacheTime && (Date.now() - parseInt(cacheTime)) < 3600000) {
      this.lookups = JSON.parse(cached);
      return;
    }

    try {
      // Load fresh data
      const data = await this.apiCall('/lookups/all');
      this.lookups = data.data;

      // Cache it
      localStorage.setItem('lookups', JSON.stringify(this.lookups));
      localStorage.setItem('lookups_time', Date.now().toString());
    } catch (error) {
      console.error('Failed to load lookups:', error);
    }
  }
}
```

---

## Phase 8: Documentation

### Step 8.1: Add Inline Comments

```javascript
/**
 * Initialize the application
 * Loads initial data: health status, stats, and lookup tables
 */
async init() {
  this.applyDarkMode();
  await this.loadHealth();
  await this.loadStats();
  await this.loadLookups();
  this.currentView = 'home';
}
```

### Step 8.2: Create User Guide Section

```html
<!-- Help/Guide Modal -->
<div v-if="showHelp"
     class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
     @click="showHelp = false">
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-8"
       @click.stop>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-gray-800 dark:text-white">User Guide</h2>
      <button @click="showHelp = false" class="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
        <span class="text-3xl">&times;</span>
      </button>
    </div>

    <div class="space-y-6 text-gray-700 dark:text-gray-300">
      <section>
        <h3 class="text-lg font-semibold mb-2">Browsing Data</h3>
        <p>Click on any stat card on the home page to explore that dataset. Use the filters and search to narrow down results.</p>
      </section>

      <section>
        <h3 class="text-lg font-semibold mb-2">Searching</h3>
        <p>Enter search terms in the search bar and press Enter. The search looks across multiple fields to find relevant results.</p>
      </section>

      <section>
        <h3 class="text-lg font-semibold mb-2">Sorting</h3>
        <p>Click on column headers to sort by that field. Click again to reverse the sort order.</p>
      </section>

      <section>
        <h3 class="text-lg font-semibold mb-2">Keyboard Shortcuts</h3>
        <ul class="list-disc list-inside space-y-1">
          <li><kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+K</kbd> - Focus search</li>
          <li><kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ctrl+D</kbd> - Toggle dark mode</li>
          <li><kbd class="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> - Close modals</li>
        </ul>
      </section>
    </div>
  </div>
</div>
```

---

## Best Practices

### Code Organization
1. Keep methods focused and single-purpose
2. Use computed properties for derived state
3. Add comments for complex logic
4. Group related functionality together

### User Experience
1. Show loading states during API calls
2. Display helpful error messages
3. Provide empty states with guidance
4. Use animations sparingly for polish
5. Ensure touch targets are large enough on mobile

### Performance
1. Debounce search and filter inputs
2. Cache static lookup data
3. Use virtual scrolling for very large lists
4. Lazy load images if present
5. Minimize DOM manipulation

### Accessibility
1. Use semantic HTML elements
2. Provide alt text for icons
3. Ensure keyboard navigation works
4. Maintain good color contrast
5. Add ARIA labels where needed

---

## Summary Checklist

- [ ] /public/index.html created
- [ ] Vue.js, Axios, Tailwind CSS loaded via CDN
- [ ] Dark mode implemented and persisted
- [ ] API base URL configured
- [ ] Home view with stats cards
- [ ] List view with table and pagination
- [ ] Detail view for individual records
- [ ] Search functionality working
- [ ] Filtering implemented
- [ ] Sorting implemented
- [ ] Mobile responsive design
- [ ] Loading states shown
- [ ] Error handling implemented
- [ ] Empty states designed
- [ ] Export functionality (optional)
- [ ] Browser testing complete
- [ ] Mobile device testing complete
- [ ] No console errors

---

**End of SKILL3: Frontend Application Generation**
