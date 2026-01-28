# Syntax Highlighting Showcase

This note demonstrates the **vivid VS Code-style syntax highlighting** for the most common programming languages.

## JavaScript / TypeScript

```javascript
// JavaScript with ES6+ features
class UserManager {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
        this.users = new Map();
    }
    
    async fetchUser(userId) {
        const response = await fetch(`${this.apiUrl}/users/${userId}`);
        const user = await response.json();
        this.users.set(userId, user);
        return user;
    }
    
    getUserNames() {
        return Array.from(this.users.values()).map(u => u.name);
    }
}

const manager = new UserManager('https://api.example.com');
manager.fetchUser(123).then(user => console.log(user.name));
```

```typescript
// TypeScript with types
interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'user' | 'guest';
}

class TypedUserManager {
    private users: Map<number, User> = new Map();
    
    constructor(private apiUrl: string) {}
    
    async fetchUser(userId: number): Promise<User> {
        const response = await fetch(`${this.apiUrl}/users/${userId}`);
        return await response.json() as User;
    }
}
```

## Python

```python
# Python with modern features
from dataclasses import dataclass
from typing import List, Optional
import asyncio

@dataclass
class User:
    """User data model"""
    id: int
    name: str
    email: str
    is_active: bool = True

class UserRepository:
    def __init__(self, db_connection):
        self.db = db_connection
        self._cache: dict[int, User] = {}
    
    async def get_user(self, user_id: int) -> Optional[User]:
        """Fetch user by ID with caching"""
        if user_id in self._cache:
            return self._cache[user_id]
        
        query = "SELECT * FROM users WHERE id = ?"
        result = await self.db.fetch_one(query, user_id)
        
        if result:
            user = User(**result)
            self._cache[user_id] = user
            return user
        return None

# Usage
async def main():
    repo = UserRepository(db)
    user = await repo.get_user(42)
    print(f"Found user: {user.name}")

asyncio.run(main())
```

## Java

```java
// Java with modern features
import java.util.*;
import java.util.stream.*;

public class UserService {
    private final Map<Long, User> userCache;
    private final UserRepository repository;
    
    public UserService(UserRepository repository) {
        this.repository = repository;
        this.userCache = new ConcurrentHashMap<>();
    }
    
    public Optional<User> findUser(Long userId) {
        return Optional.ofNullable(userCache.get(userId))
            .or(() -> repository.findById(userId)
                .map(user -> {
                    userCache.put(userId, user);
                    return user;
                }));
    }
    
    public List<String> getActiveUserNames() {
        return userCache.values().stream()
            .filter(User::isActive)
            .map(User::getName)
            .collect(Collectors.toList());
    }
}

record User(Long id, String name, String email, boolean isActive) {}
```

## C++

```cpp
// Modern C++ (C++17/20)
#include <iostream>
#include <vector>
#include <memory>
#include <optional>
#include <string_view>

class User {
private:
    std::string name_;
    std::string email_;
    int id_;
    
public:
    User(int id, std::string_view name, std::string_view email)
        : id_(id), name_(name), email_(email) {}
    
    [[nodiscard]] const std::string& name() const noexcept { return name_; }
    [[nodiscard]] int id() const noexcept { return id_; }
};

template<typename T>
class Repository {
private:
    std::vector<std::unique_ptr<T>> items_;
    
public:
    void add(std::unique_ptr<T> item) {
        items_.push_back(std::move(item));
    }
    
    std::optional<T*> find(int id) const {
        for (const auto& item : items_) {
            if (item->id() == id) {
                return item.get();
            }
        }
        return std::nullopt;
    }
};

int main() {
    Repository<User> repo;
    repo.add(std::make_unique<User>(1, "Alice", "alice@example.com"));
    
    if (auto user = repo.find(1)) {
        std::cout << "Found: " << (*user)->name() << std::endl;
    }
    
    return 0;
}
```

## C# / .NET

```csharp
// C# with modern features
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace UserManagement
{
    public record User(int Id, string Name, string Email, bool IsActive);
    
    public interface IUserRepository
    {
        Task<User?> GetUserAsync(int userId);
        Task<IEnumerable<User>> GetActiveUsersAsync();
    }
    
    public class UserService
    {
        private readonly IUserRepository _repository;
        private readonly Dictionary<int, User> _cache;
        
        public UserService(IUserRepository repository)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _cache = new Dictionary<int, User>();
        }
        
        public async Task<User?> GetUserWithCacheAsync(int userId)
        {
            if (_cache.TryGetValue(userId, out var cachedUser))
                return cachedUser;
            
            var user = await _repository.GetUserAsync(userId);
            
            if (user is not null)
                _cache[userId] = user;
            
            return user;
        }
        
        public async Task<List<string>> GetActiveUserNamesAsync() =>
            (await _repository.GetActiveUsersAsync())
                .Where(u => u.IsActive)
                .Select(u => u.Name)
                .ToList();
    }
}
```

## Go (Golang)

```go
// Go with modern idioms
package main

import (
    "context"
    "errors"
    "fmt"
    "sync"
)

type User struct {
    ID       int64  `json:"id"`
    Name     string `json:"name"`
    Email    string `json:"email"`
    IsActive bool   `json:"is_active"`
}

type UserRepository interface {
    GetUser(ctx context.Context, id int64) (*User, error)
    GetActiveUsers(ctx context.Context) ([]*User, error)
}

type userService struct {
    repo  UserRepository
    cache sync.Map
}

func NewUserService(repo UserRepository) *userService {
    return &userService{
        repo:  repo,
        cache: sync.Map{},
    }
}

func (s *userService) GetUserWithCache(ctx context.Context, id int64) (*User, error) {
    if cached, ok := s.cache.Load(id); ok {
        return cached.(*User), nil
    }
    
    user, err := s.repo.GetUser(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    
    if user == nil {
        return nil, errors.New("user not found")
    }
    
    s.cache.Store(id, user)
    return user, nil
}

func main() {
    ctx := context.Background()
    service := NewUserService(nil)
    
    user, err := service.GetUserWithCache(ctx, 1)
    if err != nil {
        fmt.Printf("Error: %v\n", err)
        return
    }
    
    fmt.Printf("User: %s\n", user.Name)
}
```

## Rust

```rust
// Rust with ownership and borrowing
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

#[derive(Debug, Clone)]
struct User {
    id: u64,
    name: String,
    email: String,
    is_active: bool,
}

trait UserRepository {
    fn get_user(&self, id: u64) -> Option<User>;
    fn get_active_users(&self) -> Vec<User>;
}

struct UserService {
    repository: Arc<dyn UserRepository>,
    cache: Arc<Mutex<HashMap<u64, User>>>,
}

impl UserService {
    fn new(repository: Arc<dyn UserRepository>) -> Self {
        Self {
            repository,
            cache: Arc::new(Mutex::new(HashMap::new())),
        }
    }
    
    fn get_user_with_cache(&self, id: u64) -> Option<User> {
        // Check cache first
        if let Ok(cache) = self.cache.lock() {
            if let Some(user) = cache.get(&id) {
                return Some(user.clone());
            }
        }
        
        // Fetch from repository
        if let Some(user) = self.repository.get_user(id) {
            if let Ok(mut cache) = self.cache.lock() {
                cache.insert(id, user.clone());
            }
            Some(user)
        } else {
            None
        }
    }
}

fn main() {
    println!("Rust user service example");
}
```

## PHP

```php
<?php
// Modern PHP 8+ with attributes and types
namespace App\Service;

use App\Repository\UserRepository;
use App\Model\User;

#[Service]
class UserService
{
    private array $cache = [];
    
    public function __construct(
        private readonly UserRepository $repository
    ) {}
    
    public function getUserWithCache(int $userId): ?User
    {
        if (isset($this->cache[$userId])) {
            return $this->cache[$userId];
        }
        
        $user = $this->repository->find($userId);
        
        if ($user !== null) {
            $this->cache[$userId] = $user;
        }
        
        return $user;
    }
    
    public function getActiveUserNames(): array
    {
        return array_map(
            fn(User $user) => $user->getName(),
            array_filter(
                $this->cache,
                fn(User $user) => $user->isActive()
            )
        );
    }
}

readonly class User
{
    public function __construct(
        public int $id,
        public string $name,
        public string $email,
        public bool $isActive = true
    ) {}
    
    public function getName(): string
    {
        return $this->name;
    }
    
    public function isActive(): bool
    {
        return $this->isActive;
    }
}
```

## Ruby

```ruby
# Ruby with modern syntax
require 'json'
require 'net/http'

class User
  attr_reader :id, :name, :email
  attr_accessor :active
  
  def initialize(id:, name:, email:, active: true)
    @id = id
    @name = name
    @email = email
    @active = active
  end
  
  def active?
    @active
  end
  
  def to_json(*args)
    {
      id: @id,
      name: @name,
      email: @email,
      active: @active
    }.to_json(*args)
  end
end

class UserService
  def initialize(repository)
    @repository = repository
    @cache = {}
  end
  
  def get_user_with_cache(user_id)
    @cache[user_id] ||= @repository.find(user_id)
  end
  
  def active_user_names
    @cache.values
      .select(&:active?)
      .map(&:name)
  end
  
  def fetch_from_api(user_id)
    uri = URI("https://api.example.com/users/#{user_id}")
    response = Net::HTTP.get_response(uri)
    
    if response.is_a?(Net::HTTPSuccess)
      data = JSON.parse(response.body, symbolize_names: true)
      User.new(**data)
    else
      nil
    end
  end
end

# Usage
service = UserService.new(repository)
user = service.get_user_with_cache(42)
puts "User: #{user.name}" if user
```

## Swift

```swift
// Swift with modern features
import Foundation

struct User: Codable {
    let id: Int
    let name: String
    let email: String
    var isActive: Bool = true
}

protocol UserRepository {
    func getUser(id: Int) async throws -> User?
    func getActiveUsers() async throws -> [User]
}

class UserService {
    private let repository: UserRepository
    private var cache: [Int: User] = [:]
    private let queue = DispatchQueue(label: "com.example.userservice")
    
    init(repository: UserRepository) {
        self.repository = repository
    }
    
    func getUserWithCache(id: Int) async throws -> User? {
        if let cached = queue.sync(execute: { cache[id] }) {
            return cached
        }
        
        guard let user = try await repository.getUser(id: id) else {
            return nil
        }
        
        queue.sync {
            cache[id] = user
        }
        
        return user
    }
    
    func getActiveUserNames() async throws -> [String] {
        let users = try await repository.getActiveUsers()
        return users
            .filter { $0.isActive }
            .map { $0.name }
    }
}

// Usage
Task {
    let service = UserService(repository: myRepository)
    if let user = try await service.getUserWithCache(id: 1) {
        print("Found user: \(user.name)")
    }
}
```

## SQL

```sql
-- PostgreSQL with modern features
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;

-- Complex query with CTEs
WITH active_users AS (
    SELECT id, name, email, created_at
    FROM users
    WHERE is_active = true
),
user_stats AS (
    SELECT 
        COUNT(*) as total_users,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users
    FROM active_users
)
SELECT * FROM user_stats;

-- Stored procedure
CREATE OR REPLACE FUNCTION get_user_by_email(user_email VARCHAR)
RETURNS TABLE(id BIGINT, name VARCHAR, email VARCHAR) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email
    FROM users u
    WHERE u.email = user_email AND u.is_active = true;
END;
$$ LANGUAGE plpgsql;
```

## Bash/Shell

```bash
#!/bin/bash
# Bash script with modern features

set -euo pipefail  # Exit on error, undefined vars, pipe failures

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="${SCRIPT_DIR}/deploy.log"

# Color codes
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly NC='\033[0m'  # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $*" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $*" >&2 | tee -a "$LOG_FILE"
    exit 1
}

deploy_app() {
    local env="${1:-production}"
    local version="${2:-latest}"
    
    log "Deploying application to ${env} environment..."
    log "Version: ${version}"
    
    # Build
    if ! npm run build; then
        error "Build failed"
    fi
    
    # Run tests
    if ! npm test; then
        error "Tests failed"
    fi
    
    # Deploy
    log "Deploying to ${env}..."
    rsync -avz --delete dist/ "server:/var/www/${env}/"
    
    log "${GREEN}Deployment successful!${NC}"
}

# Main
main() {
    if [[ $# -lt 1 ]]; then
        echo "Usage: $0 <environment> [version]"
        exit 1
    fi
    
    deploy_app "$@"
}

main "$@"
```

## YAML

```yaml
# Kubernetes deployment configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: production
  labels:
    app: user-service
    version: v2.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: user-service
  template:
    metadata:
      labels:
        app: user-service
        version: v2.0.0
    spec:
      containers:
      - name: user-service
        image: myregistry/user-service:2.0.0
        ports:
        - containerPort: 8080
          protocol: TCP
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: db-credentials
              key: url
        - name: CACHE_ENABLED
          value: "true"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 5
```

## Dockerfile

```dockerfile
# Multi-stage Dockerfile for Node.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built assets from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start application
CMD ["node", "dist/server.js"]
```

## JSON

```json
{
  "name": "user-service",
  "version": "2.0.0",
  "description": "User management microservice",
  "main": "dist/server.js",
  "scripts": {
    "start": "node dist/server.js",
    "dev": "nodemon src/server.ts",
    "build": "tsc && webpack --mode production",
    "test": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "format": "prettier --write src/**/*.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "redis": "^4.6.7"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.5.0",
    "eslint": "^8.42.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## Summary

This showcase demonstrates **vivid VS Code-style syntax highlighting** for:

- **JavaScript/TypeScript** - Modern ES6+, async/await, generics
- **Python** - Dataclasses, async, type hints
- **Java** - Records, streams, modern features
- **C++** - Modern C++17/20 features
- **C#** - Records, async, LINQ
- **Go** - Goroutines, interfaces, error handling
- **Rust** - Ownership, traits, safe concurrency
- **PHP** - PHP 8+, attributes, typed properties
- **Ruby** - Blocks, symbols, metaprogramming
- **Swift** - Async/await, protocols, SwiftUI
- **SQL** - CTEs, window functions, procedures
- **Bash** - Modern shell scripting
- **YAML** - Kubernetes configs
- **Dockerfile** - Multi-stage builds
- **JSON** - Configuration files

All with **vibrant, eye-catching colors** similar to VS Code's default dark theme! 🎨✨
