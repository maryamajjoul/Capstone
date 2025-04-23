package com.example.gateway_admin.Controller;

import com.example.gateway_admin.Security.JwtTokenProvider;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
@Slf4j
public class AuthController {

    private final ReactiveAuthenticationManager authManager;
    private final JwtTokenProvider jwtProvider;

    public AuthController(ReactiveAuthenticationManager authManager,
                          JwtTokenProvider jwtProvider) {
        this.authManager  = authManager;
        this.jwtProvider  = jwtProvider;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<JwtResponse>> login(@RequestBody LoginRequest req) {
        return authManager
                .authenticate(new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()))
                .flatMap(auth -> {
                    // SUCCESS → generate token
                    String token = jwtProvider.generateToken(auth);
                    List<String> roles = auth.getAuthorities().stream()
                            .map(a -> a.getAuthority())
                            .collect(Collectors.toList());
                    JwtResponse resp = new JwtResponse(token, req.getUsername(), roles);
                    return Mono.just(ResponseEntity.ok(resp));
                })
                .doOnError(e -> {
                    // PRINT FULL STACKTRACE
                    log.error("Error in /api/auth/login for user [{}]:", req.getUsername(), e);
                })
                .onErrorResume(e ->
                        // ALL FAILURES → 401 Unauthorized
                        Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).build())
                );
    }

    @Data
    private static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    private static class JwtResponse {
        private final String token;
        private final String type     = "Bearer";
        private final String username;
        private final List<String> roles;
    }
}
