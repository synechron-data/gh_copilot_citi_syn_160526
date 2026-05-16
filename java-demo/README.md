# copilot-demo-java

Small Java / Spring Boot demo project used for GitHub Copilot training sessions.

## Overview

This repository contains a few focused Java classes that are intended for live demos rather than as a complete production-ready application. The codebase includes:

- `ArrayUtils.java`: Utility helpers for working with lists.
- `AuthController.java`: A simple Spring-style authentication controller using an in-memory user store.
- `PriceCalculator.java`: An intentionally minimal component used for comment-driven development demos.
- `pom.xml`: Maven configuration targeting Spring Boot 3.3.4 and Java 21.

## Current State

The repository is currently set up more like a training sandbox than a standard runnable Spring Boot app.

- Java source files are stored in the project root, not under `src/main/java`.
- There is no Spring Boot application entry point such as a `@SpringBootApplication` class.
- No test sources are present.
- Some files contain intentional demo placeholders or known issues used during training exercises.

Examples of intentional demo state:

- `ArrayUtils.findLastEven(...)` currently returns the first even number, even though the method name and comment describe returning the last one.
- `AuthController` keeps password hashing logic inline so it can be refactored during a demo.
- `PriceCalculator` is intentionally unfinished.

## Dependencies

The Maven configuration declares:

- Spring Boot Web
- Spring Boot Validation
- Spring Boot Actuator
- Spring Security Crypto
- Spring Boot Test

Required Java version:

- Java 21

## Build Notes

As checked in this workspace, the project is not ready for a normal Maven build for two reasons:

1. Maven is not installed or not available on `PATH` in the current environment.
2. The project layout does not follow the standard Maven directory structure expected by `pom.xml`.

To make this project buildable as a Spring Boot application, the next steps would typically be:

1. Move source files into `src/main/java/...` using package-aligned directories.
2. Add a Spring Boot application bootstrap class.
3. Add tests under `src/test/java`.
4. Ensure Maven is installed, or add the Maven wrapper (`mvnw`, `mvnw.cmd`).

## Example Maven Command

Once the structure is normalized and Maven is available, a typical validation command would be:

```bash
mvn test
```

## Intended Use

This repository is best understood as a lightweight workshop/demo project for practicing:

- code explanation
- comment-driven development
- small refactors
- bug fixing with Copilot
- test generation

## License

No license file is currently present in this repository.