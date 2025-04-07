// src/main/java/com/example/gateway_admin/Controller/GatewayRouteController.java
package com.example.gateway_admin.Controller;

import com.example.gateway_admin.Entities.GatewayRoute;
import com.example.gateway_admin.Services.GatewayRouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/gateway-routes")
public class GatewayRouteController {

    private final GatewayRouteService gatewayRouteService;

    public GatewayRouteController(GatewayRouteService gatewayRouteService) {
        this.gatewayRouteService = gatewayRouteService;
    }

    @GetMapping
    public List<GatewayRoute> getAllRoutes() {
        return gatewayRouteService.getAllRoutes();
    }

    @GetMapping("/{id}")
    public ResponseEntity<GatewayRoute> getRouteById(@PathVariable Long id) {
        GatewayRoute route = gatewayRouteService.getRouteById(id);
        if (route == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(route);
    }

    @PostMapping
    public GatewayRoute createRoute(@RequestBody GatewayRoute route) {
        return gatewayRouteService.createRoute(route);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GatewayRoute> updateRoute(@PathVariable Long id, @RequestBody GatewayRoute updatedRoute) {
        GatewayRoute existingRoute = gatewayRouteService.getRouteById(id);
        if (existingRoute == null) {
            return ResponseEntity.notFound().build();
        }
        updatedRoute.setId(id);
        GatewayRoute savedRoute = gatewayRouteService.updateRoute(id, updatedRoute);
        return ResponseEntity.ok(savedRoute);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<GatewayRoute> patchRoute(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        GatewayRoute existingRoute = gatewayRouteService.getRouteById(id);
        if (existingRoute == null) {
            return ResponseEntity.notFound().build();
        }
        if (updates.containsKey("routeId")) {
            existingRoute.setRouteId((String) updates.get("routeId"));
        }
        if (updates.containsKey("uri")) {
            existingRoute.setUri((String) updates.get("uri"));
        }
        if (updates.containsKey("predicates")) {
            existingRoute.setPredicates((String) updates.get("predicates"));
        }
        if (updates.containsKey("withIpFilter")) {
            existingRoute.setWithIpFilter((Boolean) updates.get("withIpFilter"));
        }
        if (updates.containsKey("withToken")) {
            existingRoute.setWithToken((Boolean) updates.get("withToken"));
        }
        if (updates.containsKey("withRateLimit")) {
            existingRoute.setWithRateLimit((Boolean) updates.get("withRateLimit"));
        }
        GatewayRoute updatedRoute = gatewayRouteService.updateRoute(id, existingRoute);
        return ResponseEntity.ok(updatedRoute);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoute(@PathVariable Long id) {
        GatewayRoute existingRoute = gatewayRouteService.getRouteById(id);
        if (existingRoute == null) {
            return ResponseEntity.notFound().build();
        }
        gatewayRouteService.deleteRoute(id);
        return ResponseEntity.ok().build();
    }
}
