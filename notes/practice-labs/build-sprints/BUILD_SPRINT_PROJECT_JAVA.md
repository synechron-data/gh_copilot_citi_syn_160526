# Build Sprint Project (Java / Spring Boot) — Task Management REST API

**Used in:** Module 6 (Build Sprint, 60 min) and Module 7 (Capstone, 45 min)
**Stack:** Java 21 LTS + Spring Boot 3.3.x + Maven + Bean Validation + JUnit 5 + Mockito
**Storage:** In-memory (`ConcurrentHashMap`) — no database for this exercise

> This is the Java/Spring counterpart to `BUILD_SPRINT_PROJECT.md`. Endpoints, shapes, and architecture are identical so the trainer handbook (`TRAINER_HANDBOOK.md`) applies unchanged. Pick this version when the cohort writes Java/Spring day-to-day.

---

## Why this project

You need a small, realistic, well-bounded project to practise deliberate Copilot usage. A Task Management API is:

- Familiar enough that you don't waste time on domain confusion.
- Multi-file enough to exercise Agent mode (controller + service + repository + DTOs).
- Tested and documented enough to fill the Capstone.
- Real-shaped enough that the workflow generalises to your actual work.

Treat the spec as a customer brief. You are the engineer. Copilot is your pair.

---

## Functional Requirements

### Resource: `Task`

| Field | Type | Constraints |
|-------|------|-------------|
| `id` | `UUID` | Server-generated, immutable |
| `title` | `String` | 1–200 chars, required, trimmed |
| `description` | `String` | 0–2000 chars, optional |
| `status` | `TaskStatus` enum: `TODO`, `IN_PROGRESS`, `DONE` | Required, default `TODO` |
| `priority` | `TaskPriority` enum: `LOW`, `MEDIUM`, `HIGH` | Required, default `MEDIUM` |
| `createdAt` | `Instant` | Server-set on create, immutable |
| `updatedAt` | `Instant` | Server-set on create and every update |

JSON representation uses `lower_snake_case` field names (`created_at`, `updated_at`) and enum values as lowercase strings (`todo`, `in_progress`, `done`, `low`, `medium`, `high`).

### Endpoints

#### 1. `POST /api/tasks` — Create a task

**Request:**
```json
{
  "title": "Review the deployment script",
  "description": "Walk through deploy.sh, check rollback path",
  "status": "todo",
  "priority": "high"
}
```

- `title` required. Others optional (defaults: `status: todo`, `priority: medium`, `description: ""`).
- Validate. Return 400 on invalid input.

**Response: 201 Created**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Review the deployment script",
  "description": "Walk through deploy.sh, check rollback path",
  "status": "todo",
  "priority": "high",
  "created_at": "2026-05-16T09:00:00Z",
  "updated_at": "2026-05-16T09:00:00Z"
}
```

#### 2. `GET /api/tasks` — List tasks

**Query parameters (all optional):**

- `status` — `todo` | `in_progress` | `done`
- `priority` — `low` | `medium` | `high`
- `limit` — page size (default 50, max 200)
- `offset` — pagination offset (default 0)

**Response: 200 OK**
```json
{
  "data": [ /* array of tasks */ ],
  "total": 42,
  "limit": 50,
  "offset": 0
}
```

#### 3. `GET /api/tasks/{id}` — Fetch one

**Response: 200 OK** with task body, or **404 Not Found** if missing.

#### 4. `PATCH /api/tasks/{id}` — Update fields

Any subset of `title`, `description`, `status`, `priority`. Reject empty body with 400. Refresh `updated_at` on every change.

**Response: 200 OK** or **404 Not Found**.

#### 5. `DELETE /api/tasks/{id}`

**Response: 204 No Content**, or **404 Not Found**.

### Error Response Shape

All non-2xx responses:

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request validation failed",
    "details": [
      { "path": "title", "message": "must be between 1 and 200 characters" }
    ]
  }
}
```

Codes:
- `VALIDATION_FAILED` — 400
- `NOT_FOUND` — 404
- `INTERNAL_ERROR` — 500

### Cross-cutting

- `GET /health` — Spring Boot Actuator default (`/actuator/health`) is fine; or a custom `GET /health` returning `{"status":"ok","uptime_seconds":42}`.
- All responses are JSON.
- Request logging via SLF4J at `INFO`, excluding bodies that may contain PII.
- Unhandled exceptions → global `@ControllerAdvice` handler → 500 + `INTERNAL_ERROR`.

---

## Architecture

Layered, with each layer's responsibility kept narrow.

```
HTTP Request
     │
     ▼
┌──────────────────┐
│   @RestController│  HTTP routing. Delegates to the service.
│   (controller)   │  Owns request DTOs and Bean Validation annotations.
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│    @Service      │  Business logic. Coordinates one or more repositories.
│    (service)     │  Throws domain exceptions (e.g. TaskNotFoundException).
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   @Repository    │  Data access. For this sprint: ConcurrentHashMap.
│   (repository)   │  No business logic.
└──────────────────┘
```

### Maven Module Layout

```
task-api/
├── .github/
│   ├── copilot-instructions.md
│   └── prompts/                                          (optional, custom slash commands)
├── src/
│   ├── main/
│   │   ├── java/com/synechron/taskapi/
│   │   │   ├── TaskApiApplication.java                   (Spring Boot main class)
│   │   │   ├── config/
│   │   │   │   ├── AppConfig.java
│   │   │   │   └── WebConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── TaskController.java
│   │   │   │   └── HealthController.java
│   │   │   ├── service/
│   │   │   │   ├── TaskService.java
│   │   │   │   └── impl/TaskServiceImpl.java
│   │   │   ├── repository/
│   │   │   │   ├── TaskRepository.java
│   │   │   │   └── impl/InMemoryTaskRepository.java
│   │   │   ├── domain/
│   │   │   │   ├── Task.java                             (domain model)
│   │   │   │   ├── TaskStatus.java
│   │   │   │   └── TaskPriority.java
│   │   │   ├── dto/
│   │   │   │   ├── CreateTaskRequest.java
│   │   │   │   ├── UpdateTaskRequest.java
│   │   │   │   ├── TaskResponse.java
│   │   │   │   ├── ListTasksResponse.java
│   │   │   │   └── ErrorResponse.java
│   │   │   ├── mapper/
│   │   │   │   └── TaskMapper.java                       (domain ↔ DTO)
│   │   │   └── exception/
│   │   │       ├── TaskNotFoundException.java
│   │   │       ├── ValidationException.java
│   │   │       └── GlobalExceptionHandler.java           (@ControllerAdvice)
│   │   └── resources/
│   │       ├── application.yml
│   │       └── logback-spring.xml
│   └── test/
│       └── java/com/synechron/taskapi/
│           ├── repository/InMemoryTaskRepositoryTest.java
│           ├── service/TaskServiceImplTest.java
│           └── controller/TaskControllerTest.java
├── docs/
│   └── openapi.yaml                                      (generated in Module 7)
├── requests.http                                         (REST Client smoke tests)
├── pom.xml
├── .gitignore
└── README.md
```

---

## Starter `pom.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>

    <groupId>com.synechron</groupId>
    <artifactId>task-api</artifactId>
    <version>1.0.0</version>
    <name>task-api</name>
    <description>Task Management REST API — Copilot training build sprint</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-actuator</artifactId>
        </dependency>

        <!-- Optional: Lombok. Comment out if the team does not use it. -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>

        <!-- Optional: MapStruct for type-safe mappers. -->
        <dependency>
            <groupId>org.mapstruct</groupId>
            <artifactId>mapstruct</artifactId>
            <version>1.6.0</version>
        </dependency>

        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </path>
                        <path>
                            <groupId>org.mapstruct</groupId>
                            <artifactId>mapstruct-processor</artifactId>
                            <version>1.6.0</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

---

## Starter `application.yml`

```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  application:
    name: task-api
  jackson:
    property-naming-strategy: SNAKE_CASE
    serialization:
      write-dates-as-timestamps: false
    deserialization:
      fail-on-unknown-properties: true

management:
  endpoints:
    web:
      exposure:
        include: health,info
  endpoint:
    health:
      show-details: when-authorized

logging:
  level:
    root: INFO
    com.synechron.taskapi: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} %-5level [%X{requestId:-}] %logger{36} - %msg%n"

task-api:
  pagination:
    default-limit: 50
    max-limit: 200
```

---

## Starter `.github/copilot-instructions.md` (Java version)

A full standards document is in `reference/copilot-instructions-demo-java.md`. The condensed version to commit at scaffold time:

```markdown
# Project Coding Standards for GitHub Copilot

## Language & Framework
- Java 21. Records for immutable DTOs. Pattern matching where it clarifies.
- Spring Boot 3.3.x. Spring Web (MVC), Bean Validation (jakarta.validation), Spring Actuator.
- Maven build. Single-module project for this sprint.

## Architecture
- Layered: @RestController → @Service → @Repository.
- Controllers in `controller/` — HTTP only. No business logic.
- Services in `service/` — business logic. Throw domain exceptions; never touch HttpServletResponse.
- Repositories in `repository/` — data access only.
- Constructor injection. No @Autowired on fields.

## DTOs & Domain
- Request and response DTOs in `dto/` as Java records.
- Domain model in `domain/` as records or classes with sealed interfaces where applicable.
- Use MapStruct (or hand-written mappers in `mapper/`) to convert domain ↔ DTO. Never expose domain types directly from controllers.

## Validation & Errors
- Validate request bodies with @Valid plus jakarta.validation annotations on the request record.
- Domain exceptions in `exception/`: TaskNotFoundException, ValidationException.
- A single @ControllerAdvice global handler converts exceptions to the ErrorResponse shape:
  `{ "error": { "code": ..., "message": ..., "details": [...] } }`
- Never catch Exception broadly to swallow errors. Let them bubble to the handler.

## Naming & Style
- `camelCase` methods and variables. `PascalCase` classes. `UPPER_SNAKE_CASE` constants.
- Package names lowercase, no underscores.
- One public class per file. File name matches class name.

## Testing
- JUnit 5 (Jupiter) + Mockito + AssertJ.
- Test classes named `<ClassUnderTest>Test`, mirroring the package structure.
- Mock dependencies with `@Mock`/`@InjectMocks` from Mockito. Reset state in `@BeforeEach`.
- Service tests do not start a Spring context. Use plain unit tests.
- Controller tests use `@WebMvcTest` and `MockMvc`.

## Logging
- SLF4J via `private static final Logger log = LoggerFactory.getLogger(<Class>.class);`
  (or `@Slf4j` from Lombok if Lombok is enabled).
- `log.info` for normal flow, `log.warn` for recoverable issues, `log.error` for unexpected.
- Use parameterised messages: `log.info("Task created id={} priority={}", id, priority);` — never string concatenation.
- Never log secrets, full request bodies, or PII.

## What NOT to do
- No `System.out.println` in production code.
- No field injection (`@Autowired` on a field).
- No business logic in controllers or repositories.
- No `@Transactional` in controllers — only on service methods.
- No exposing domain entities directly in HTTP responses.
- No checked exceptions in domain code unless the framework requires it.
```

---

## Starter `requests.http` (REST Client smoke tests)

```http
### Health check

GET http://localhost:8080/actuator/health


### Create a task

POST http://localhost:8080/api/tasks
Content-Type: application/json

{
  "title": "Review the deployment script",
  "description": "Walk through deploy.sh, check the rollback path.",
  "status": "todo",
  "priority": "high"
}


### Create a minimal task (defaults applied)

POST http://localhost:8080/api/tasks
Content-Type: application/json

{
  "title": "Reply to procurement"
}


### Create — validation failure (blank title)

POST http://localhost:8080/api/tasks
Content-Type: application/json

{
  "title": ""
}


### List all tasks

GET http://localhost:8080/api/tasks


### List with filters

GET http://localhost:8080/api/tasks?status=todo&priority=high&limit=10


### Get one task (replace {{taskId}} after creating)

@taskId = REPLACE_ME_WITH_AN_ACTUAL_ID

GET http://localhost:8080/api/tasks/{{taskId}}


### Get one — not found

GET http://localhost:8080/api/tasks/00000000-0000-0000-0000-000000000000


### Update a task

PATCH http://localhost:8080/api/tasks/{{taskId}}
Content-Type: application/json

{
  "status": "in_progress"
}


### Update — validation failure (empty body)

PATCH http://localhost:8080/api/tasks/{{taskId}}
Content-Type: application/json

{}


### Delete a task

DELETE http://localhost:8080/api/tasks/{{taskId}}


### Delete — not found

DELETE http://localhost:8080/api/tasks/00000000-0000-0000-0000-000000000000
```

---

## Module 6 Suggested Flow (Java)

### Step 1 — Scaffold (15 min)

Open Copilot Chat in **Agent** mode. Prompt:

```
Acting as a senior backend engineer.

TASK: Scaffold a new Spring Boot 3.3.x project for a Task Management REST API.

CONTEXT: Will follow the spec in /BUILD_SPRINT_PROJECT_JAVA.md. Layered
architecture (controller → service → repository). In-memory store for now
(ConcurrentHashMap-backed repository). We use Java 21, Maven, Bean Validation.

CONSTRAINTS:
- Java 21, Spring Boot 3.3.x parent.
- Maven build (pom.xml).
- Package root: com.synechron.taskapi
- Layered packages: controller, service (with impl/), repository (with impl/), domain, dto, mapper, exception, config.
- Constructor injection only — never @Autowired on fields.
- Application properties in application.yml using SNAKE_CASE for JSON property naming.
- Set up .github/copilot-instructions.md with our coding standards.

OUTPUT: Create pom.xml, src/main/resources/application.yml, src/main/java/com/synechron/taskapi/TaskApiApplication.java, the empty package directories with a placeholder package-info.java in each, .gitignore, and .github/copilot-instructions.md.
```

Approve. Then:

```bash
cd task-api
./mvnw spring-boot:run
```

Confirm `GET http://localhost:8080/actuator/health` returns `{"status":"UP"}`.

### Step 2 — Domain + repository (10 min)

The domain model and repository are the foundation. Build in this order:

- `domain/TaskStatus.java`, `domain/TaskPriority.java` (enums).
- `domain/Task.java` (record).
- `exception/TaskNotFoundException.java`, `exception/ValidationException.java`.
- `repository/TaskRepository.java` (interface).
- `repository/impl/InMemoryTaskRepository.java` (`ConcurrentHashMap`-backed implementation).

Prompt sketch:

```
Acting as a senior Spring engineer.

TASK: Implement the Task domain enums, the Task record, and the InMemoryTaskRepository.

CONTEXT: See BUILD_SPRINT_PROJECT_JAVA.md for field definitions and behaviour.
Follow standards in .github/copilot-instructions.md.

CONSTRAINTS:
- Task is a Java record with the fields from the spec (id, title, description, status, priority, createdAt, updatedAt).
- TaskStatus and TaskPriority are enums with @JsonValue returning the lowercase name.
- InMemoryTaskRepository implements TaskRepository (interface) and uses ConcurrentHashMap<UUID, Task>.
- Methods: create (assigns id + timestamps), findById (Optional<Task>), findAll (status, priority, limit, offset; returns a Page-like result with total), update (throws TaskNotFoundException on missing), delete (throws TaskNotFoundException on missing).
- Repository is annotated @Repository.

OUTPUT: All four files in their respective packages.
```

### Step 3 — Service layer (10 min)

`service/TaskService.java` (interface) and `service/impl/TaskServiceImpl.java`. Thin for this sprint — but it's where future business rules would live (e.g., "cannot move from DONE back to TODO").

### Step 4 — DTOs + mapper (10 min)

Records in `dto/`:

- `CreateTaskRequest` with `@NotBlank`, `@Size(min=1, max=200)` on title, `@Size(max=2000)` on description, defaults applied in service.
- `UpdateTaskRequest` — all fields `@Nullable` but custom validation that at least one is present.
- `TaskResponse` — outbound shape (snake_case JSON via global Jackson config).
- `ListTasksResponse` — `data`, `total`, `limit`, `offset`.
- `ErrorResponse` — the structured error shape.

Plus `mapper/TaskMapper.java` for domain ↔ DTO conversion (MapStruct or hand-written).

### Step 5 — Controller (10 min)

`controller/TaskController.java`. Recommended Copilot move: Agent mode for the whole controller. Prompt:

```
Read service/TaskService.java and all files in dto/.

Generate controller/TaskController.java following our coding standards.

- @RestController, @RequestMapping("/api/tasks").
- Constructor injection of TaskService and TaskMapper.
- @PostMapping → 201 Created with TaskResponse.
- @GetMapping → 200 OK with ListTasksResponse, supports query params status, priority, limit, offset with sensible defaults bound from application.yml.
- @GetMapping("/{id}") → 200 OK with TaskResponse, or TaskNotFoundException.
- @PatchMapping("/{id}") → 200 OK with the updated TaskResponse.
- @DeleteMapping("/{id}") → 204 No Content.
- Validate request bodies with @Valid.
```

### Step 6 — Exception handler (5 min)

`exception/GlobalExceptionHandler.java` — `@ControllerAdvice`:

- `MethodArgumentNotValidException` → 400 + `VALIDATION_FAILED` with field-level details.
- `ConstraintViolationException` → 400.
- `TaskNotFoundException` → 404 + `NOT_FOUND`.
- `Exception` (fallback) → 500 + `INTERNAL_ERROR` (log the stack trace at ERROR).

### Step 7 — Smoke test (5 min)

Run `./mvnw spring-boot:run`. Open `requests.http`. Send each request. Fix anything broken.

---

## Module 7 Suggested Flow (Java)

### Documentation (15 min)

Every public class and method in `service/`, `controller/`, `repository/` gets Javadoc.

Approach A (per file): select method → `/doc with @param, @return, @throws, and an example block`.

Approach B (Agent mode):

```
Add complete Javadoc to every public type and public method in:
- service/TaskService.java
- service/impl/TaskServiceImpl.java
- repository/TaskRepository.java
- repository/impl/InMemoryTaskRepository.java
- controller/TaskController.java

For each, include: a one-sentence summary line, @param entries describing meaning (not just the type), @return, @throws for any thrown domain exceptions, and a brief usage example in {@code} blocks where it adds value.
```

### Tests (15 min)

Target structure:

```
src/test/java/com/synechron/taskapi/
├── repository/InMemoryTaskRepositoryTest.java
├── service/TaskServiceImplTest.java
└── controller/TaskControllerTest.java
```

Per-test-file prompt (service):

```
Read service/impl/TaskServiceImpl.java and repository/TaskRepository.java.

Generate service/TaskServiceImplTest.java using JUnit 5 and Mockito with AssertJ.

Setup:
- @ExtendWith(MockitoExtension.class)
- @Mock TaskRepository repository
- @InjectMocks TaskServiceImpl service

Cover for each public method:
- create: assigns id and timestamps via repository, returns the created Task
- findById: returns Optional.of(task) when present, Optional.empty() when not
- update: throws TaskNotFoundException when missing, returns updated Task with refreshed updatedAt
- delete: throws TaskNotFoundException when missing, no exception on success
- list: applies all filter combinations and pagination correctly

Use AssertJ for assertions. Verify mock interactions with verify(). Reset mocks between tests via Mockito's default behaviour.
```

Per-test-file prompt (controller):

```
Read controller/TaskController.java.

Generate controller/TaskControllerTest.java using @WebMvcTest, MockMvc, and Mockito.

For each endpoint:
- Happy path: returns the right status code and body shape
- Validation failure: 400 with the structured error body
- Not found (where applicable): 404 with the structured error body

Use ObjectMapper to assert JSON. Use @MockBean for TaskService.
```

Run:

```bash
./mvnw test
```

Iterate until green.

### OpenAPI (10 min)

Generate `docs/openapi.yaml`:

```
Read all the controller files in controller/, the DTOs in dto/, and the
enums in domain/.

Generate a complete OpenAPI 3.1 YAML specification.

Required:
- Info section with title "Task API", version 1.0.0, contact email omitted.
- Server entry pointing to http://localhost:8080.
- All paths: /actuator/health, POST /api/tasks, GET /api/tasks, GET /api/tasks/{id}, PATCH /api/tasks/{id}, DELETE /api/tasks/{id}.
- Components/schemas: Task, CreateTaskRequest, UpdateTaskRequest, ListTasksResponse, ErrorResponse, TaskStatus (enum), TaskPriority (enum).
- Each operation: summary, description, tags, parameters, requestBody where applicable, responses (200/201/204 happy + 400/404 error).
- One concrete example for each requestBody and one for each response body.
- Use snake_case for all property names to match Jackson config.

Write to docs/openapi.yaml.
```

Validate at https://editor.swagger.io.

### Debrief (5 min)

Three lines, ready for the trainer to ask:

1. Where Copilot helped most: ______
2. Where Copilot fell short: ______
3. The prompting habit I'll carry to Monday: ______

---

## Java-Specific Coaching Notes for the Trainer

A few patterns to highlight to a Java audience that differ from the Node/TS run-through:

- **Records over Lombok-laden POJOs.** Java 21 records make most DTOs a one-liner. Demonstrate. Lombok still has its place (`@Slf4j`, `@Builder` for complex domain) but records cover ~80% of DTO needs cleanly.
- **Constructor injection is non-negotiable.** Field injection (`@Autowired` on a field) is in many enterprise Java codebases — and Copilot will happily generate it. This is exactly what `.github/copilot-instructions.md` exists to prevent. Show the difference.
- **MapStruct is the right answer for mapper hell.** If the cohort hand-writes mappers, the Module 7 documentation phase is a good moment to introduce MapStruct via Copilot — "rewrite this hand-written mapper as a MapStruct interface."
- **`@WebMvcTest` vs full `@SpringBootTest`.** Coach participants to keep controller tests narrow with `@WebMvcTest`. Full-context tests are slow and over-coupled; show the right tool.
- **Jackson + `SNAKE_CASE` config.** Set once at the application level rather than annotating every field. Demonstrate via `application.yml` so Copilot sees the pattern and doesn't suggest field-level `@JsonProperty` annotations.
- **Spring Validation is "automatic" but only if you use `@Valid`.** A common Copilot mistake — generating a `@PostMapping` that accepts the request body without `@Valid`. Show the fix.

---

## Bonus / Stretch Goals (if you finish early)

- **Spring Security stub** — add a basic `OncePerRequestFilter` that verifies a hardcoded dev JWT and sets the SecurityContext. Don't build the issuer.
- **Rate limiting** — a per-IP token-bucket filter using a custom slash command or Agent mode.
- **Switch storage to H2 / Postgres via Spring Data JPA** — replace `InMemoryTaskRepository` with a JpaRepository. Bonus: do it without breaking any other file (proves the layered architecture).
- **Add a second resource (Tags)** — `POST /api/tags`, `GET /api/tags`, tag-task association. Test whether Copilot picks up the patterns from `tasks` automatically via the instructions file.
- **Add Swagger UI** — bring in `springdoc-openapi-starter-webmvc-ui` and have Copilot generate the bean configuration.

---

## Mapping to the Trainer Handbook

The trainer handbook (`TRAINER_HANDBOOK.md`) is stack-agnostic. Where the handbook says "Node.js + TypeScript + Express," substitute "Java 21 + Spring Boot." Where it says "Zod schemas," substitute "Bean Validation annotations on request records." Where it says "pino logger," substitute "SLF4J." The pedagogy, the timing, and the demo structure are unchanged.

Specifically:

| Handbook reference | Java equivalent |
|--------------------|-----------------|
| `.github/copilot-instructions.md` (TS version) | Use `reference/copilot-instructions-demo-java.md` |
| Module 3 before/after Express handler demo | Use Spring controller equivalent — generate `@PostMapping` for `/api/users` |
| Module 4 vulnerable snippet (Express + JS) | Equivalent Java snippet at `reference/vulnerable-snippet-java.md` (optional — most OWASP issues map directly) |
| Module 6 scaffold prompt | Use the Java scaffold prompt in this document |
| Module 7 doc/test/OpenAPI prompts | Use the Java versions in this document |

---

**End of Build Sprint Specification (Java).**
