package com.example.gateway_admin.Config;

import com.example.gateway_admin.Entities.User;
import com.example.gateway_admin.Repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Only add default users if the repository is empty
            if (userRepository.count() == 0) {
                // Create admin user
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                admin.setEnabled(true);
                userRepository.save(admin);

                // Create normal user
                User user = new User();
                user.setUsername("user");
                user.setPassword(passwordEncoder.encode("user123"));
                user.setRole("ROLE_USER");
                user.setEnabled(true);
                userRepository.save(user);

                System.out.println("Default users created: admin/admin123 (ADMIN) and user/user123 (USER)");
            }
        };
    }
}