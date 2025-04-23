package com.example.gateway_admin.Controller;

import com.example.gateway_admin.Entities.User;
import com.example.gateway_admin.Services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;

@RestController
@RequestMapping("/api/users")
// Removed @CrossOrigin - use global CORS config in SecurityConfig
@PreAuthorize("hasRole('ADMIN')") // Secure all methods in this controller
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public Mono<ResponseEntity<List<User>>> getAllUsers() {
        return Mono.fromCallable(() -> {
                    List<User> users = userService.getAllUsers();
                    // Ensure passwords are never sent to the client
                    users.forEach(user -> user.setPassword(null));
                    return ResponseEntity.ok(users);
                }).subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(e -> {
                    // Log error
                    System.err.println("Error fetching users: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<User>> getUserById(@PathVariable Long id) {
        return Mono.fromCallable(() -> {
                    User user = userService.getUserById(id);
                    user.setPassword(null); // Don't return password
                    return ResponseEntity.ok(user);
                }).subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(RuntimeException.class, e -> Mono.just(ResponseEntity.notFound().build())) // Handle user not found
                .onErrorResume(e -> { // Handle other errors
                    System.err.println("Error fetching user by ID: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }

    @PostMapping
    public Mono<ResponseEntity<User>> createUser(@RequestBody User user) {
        // Basic validation example (add more as needed)
        if (user.getUsername() == null || user.getUsername().isBlank() || user.getPassword() == null || user.getPassword().isBlank() || user.getRole() == null) {
            return Mono.just(ResponseEntity.badRequest().build());
        }
        // Ensure role is valid (e.g., ROLE_ADMIN or ROLE_USER) - could use an Enum
        if (!"ROLE_ADMIN".equals(user.getRole()) && !"ROLE_USER".equals(user.getRole())) {
            return Mono.just(ResponseEntity.badRequest().body(null)); // Or a specific error message
        }

        return Mono.fromCallable(() -> {
                    User createdUser = userService.createUser(user);
                    createdUser.setPassword(null); // Don't return password
                    return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
                }).subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(RuntimeException.class, e -> { // Handle username exists or other validation errors
                    System.err.println("Error creating user: " + e.getMessage());
                    // Consider returning a more specific error response if possible
                    return Mono.just(ResponseEntity.status(HttpStatus.CONFLICT).build()); // e.g., 409 Conflict for duplicate username
                })
                .onErrorResume(e -> { // Handle other errors
                    System.err.println("Generic error creating user: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }


    @PutMapping("/{id}")
    public Mono<ResponseEntity<User>> updateUser(@PathVariable Long id, @RequestBody User user) {
        // Basic validation
        if (user.getUsername() == null || user.getUsername().isBlank() || user.getRole() == null) {
            return Mono.just(ResponseEntity.badRequest().build());
        }
        if (!"ROLE_ADMIN".equals(user.getRole()) && !"ROLE_USER".equals(user.getRole())) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return Mono.fromCallable(() -> {
                    // Pass password explicitly (even if blank) to service layer to handle logic
                    User updatedUser = userService.updateUser(id, user);
                    updatedUser.setPassword(null); // Don't return password
                    return ResponseEntity.ok(updatedUser);
                }).subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(RuntimeException.class, e -> { // Handle user not found or other issues
                    System.err.println("Error updating user: " + e.getMessage());
                    // Could check exception type for not found vs other errors
                    return Mono.just(ResponseEntity.notFound().build());
                })
                .onErrorResume(e -> { // Handle other errors
                    System.err.println("Generic error updating user: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }


    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable Long id) {
        return Mono.fromRunnable(() -> userService.deleteUser(id))
                .subscribeOn(Schedulers.boundedElastic())
                .then(Mono.just(ResponseEntity.noContent().<Void>build())) // Return 204 No Content on success
                .onErrorResume(RuntimeException.class, e -> { // Handle user not found
                    System.err.println("Error deleting user (not found): " + e.getMessage());
                    return Mono.just(ResponseEntity.notFound().build()); // 404 Not Found
                })
                .onErrorResume(e -> { // Handle other errors
                    System.err.println("Error deleting user: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }
}