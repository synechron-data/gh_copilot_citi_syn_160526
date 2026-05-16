// Demo state: password hashing logic is inlined into this controller.
// During Module 4.5 (Agent Mode demo), Copilot is asked to extract this
// into com.synechron.demo.service.PasswordService, update imports, and
// add a unit test.
// Do NOT pre-refactor this file before the session.

package com.synechron.demo.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    // In-memory user store for the demo. Keyed by email.
    private final Map<String, StoredUser> users = new HashMap<>();

    // Inline password encoder — extract me into a PasswordService
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(12);

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@RequestBody RegisterRequest request) {
        if (request.email() == null || request.password() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "email and password are required"));
        }

        if (users.containsKey(request.email())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "email already registered"));
        }

        // Inline password hashing — extract me
        String passwordHash = passwordEncoder.encode(request.password());

        String id = UUID.randomUUID().toString();
        users.put(request.email(), new StoredUser(id, request.email(), passwordHash));

        log.info("User registered email={}", request.email());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("id", id, "email", request.email()));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginRequest request) {
        if (request.email() == null || request.password() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "email and password are required"));
        }

        StoredUser user = users.get(request.email());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "invalid credentials"));
        }

        // Inline password verification — extract me
        boolean valid = passwordEncoder.matches(request.password(), user.passwordHash());
        if (!valid) {
            log.warn("Login failed: bad password email={}", request.email());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "invalid credentials"));
        }

        log.info("User logged in email={}", request.email());
        return ResponseEntity.ok(Map.of("id", user.id(), "email", user.email()));
    }

    public record RegisterRequest(String email, String password) {}

    public record LoginRequest(String email, String password) {}

    private record StoredUser(String id, String email, String passwordHash) {}
}
