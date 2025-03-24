package com.example.demo.Controller;

import com.example.demo.Entity.GatewayRoute;
import com.example.demo.Repository.GatewayRouteRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class GatewayRouteController {

    private final GatewayRouteRepository repository;

    public GatewayRouteController(GatewayRouteRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/routes")
    public List<GatewayRoute> getRoutes() {
        return repository.findAll();
    }
}

