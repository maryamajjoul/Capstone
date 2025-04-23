package com.example.gateway_admin.Security;

import com.example.gateway_admin.Repositories.UserRepository;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class ReactiveUserDetailsServiceImpl implements ReactiveUserDetailsService {
    private final UserRepository userRepository;

    public ReactiveUserDetailsServiceImpl(@Lazy UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        return Mono.<UserDetails>fromCallable(() ->
                        userRepository.findByUsername(username)
                                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username))
                )
                .subscribeOn(Schedulers.boundedElastic());
    }
}