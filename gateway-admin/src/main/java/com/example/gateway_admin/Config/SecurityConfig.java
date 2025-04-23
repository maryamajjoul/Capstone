// src/main/java/com/example/gateway_admin/Config/SecurityConfig.java
package com.example.gateway_admin.Config;

import com.example.gateway_admin.Security.JwtTokenFilter;
import com.example.gateway_admin.Security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final ReactiveUserDetailsService userDetailsService;

    public SecurityConfig(JwtTokenProvider jwtTokenProvider, ReactiveUserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf().disable()
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(ex -> ex
                        .pathMatchers("/api/auth/login").permitAll()
                        .pathMatchers("/api/users/**").hasRole("ADMIN")
                        .pathMatchers(
                                "/api/gateway-routes/**",
                                "/api/ip-addresses/**",
                                "/api/rate-limit/**"
                        ).hasAnyRole("ADMIN","USER")
                        .anyExchange().authenticated()
                )
                .addFilterAt(new JwtTokenFilter(jwtTokenProvider),
                        SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // ← allow both ports
        config.setAllowedOrigins(List.of(
                "http://localhost:5173",
                "http://localhost:5174"
        ));
        config.setAllowedMethods(Arrays.asList(
                "GET","POST","PUT","PATCH","DELETE","OPTIONS"
        ));
        config.setAllowedHeaders(Arrays.asList(
                "Authorization","Content-Type","X-Requested-With"
        ));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager() {
        var authManager =
                new UserDetailsRepositoryReactiveAuthenticationManager(userDetailsService);
        authManager.setPasswordEncoder(passwordEncoder());
        return authManager;
    }
}
