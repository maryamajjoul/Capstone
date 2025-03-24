package com.example.gateway_admin.Services;

import com.example.gateway_admin.Entities.GatewayRoute;
import com.example.gateway_admin.Repositories.GatewayRouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class GatewayRouteService {

    private final GatewayRouteRepository gatewayRouteRepository;

    public GatewayRouteService(GatewayRouteRepository gatewayRouteRepository) {
        this.gatewayRouteRepository = gatewayRouteRepository;
    }

    @Transactional(readOnly = true)
    public List<GatewayRoute> getAllRoutes() {
        return gatewayRouteRepository.findAll();
    }

    @Transactional
    public GatewayRoute createRoute(GatewayRoute route) {
        return gatewayRouteRepository.save(route);
    }

    @Transactional
    public GatewayRoute updateRoute(Long id, GatewayRoute updatedRoute) {
        // Set the id so that JPA performs an update instead of an insert
        updatedRoute.setId(id);
        return gatewayRouteRepository.save(updatedRoute);
    }

    @Transactional
    public void deleteRoute(Long id) {
        gatewayRouteRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public GatewayRoute getRouteById(Long id) {
        return gatewayRouteRepository.findById(id).orElse(null);
    }
}
