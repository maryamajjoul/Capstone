package com.example.gateway_admin.Repositories;

import com.example.gateway_admin.Entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    // <-- add this method
    boolean existsByUsername(String username);
}
