package com.example.gateway_admin.Controller;

import com.example.gateway_admin.Entities.User;
import com.example.gateway_admin.Security.JwtUtil;
import com.example.gateway_admin.Services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService,
                          PasswordEncoder passwordEncoder,
                          JwtUtil jwtUtil) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Map<String,Object>>> login(@RequestBody AuthenticationRequest req) {
        log.info("→ Received login request: username='{}', password='{}'", req.getUsername(), req.getPassword());

        return Mono.fromCallable(() -> {
                    // 1) lookup
                    User user = userService.getUserByUsername(req.getUsername())
                            .orElseThrow(() -> {
                                log.warn("** NO SUCH USER ** '{}'", req.getUsername());
                                return new RuntimeException("User not found");
                            });
                    log.info("↳ Found DB user: {}, hash='{}'", user.getUsername(), user.getPassword());

                    // 2) match
                    boolean matches = passwordEncoder.matches(req.getPassword(), user.getPassword());
                    log.info("↳ passwordEncoder.matches(...) returned: {}", matches);
                    if (!matches) {
                        throw new RuntimeException("Bad credentials");
                    }

                    // 3) generate token
                    String token = jwtUtil.generateToken(
                            new org.springframework.security.core.userdetails.User(
                                    user.getUsername(),
                                    user.getPassword(),
                                    List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                            )
                    );
                    log.info("↳ JWT generated successfully");

                    // 4) respond
                    Map<String,Object> resp = new HashMap<>();
                    resp.put("id",       user.getId());
                    resp.put("username", user.getUsername());
                    resp.put("role",     user.getRole());
                    resp.put("token",    token);
                    return ResponseEntity.ok(resp);
                })
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorResume(e -> {
                    log.error("!!! Login error: {}", e.getMessage(), e);
                    Map<String,Object> err = Map.of("error", "Invalid username or password");
                    return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(err));
                });
    }

    static class AuthenticationRequest {
        private String username;
        private String password;
        public String getUsername() { return username; }
        public void setUsername(String u) { this.username = u; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
    }
}
