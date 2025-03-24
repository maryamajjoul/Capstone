package com.example.gateway_admin.Controller;

import com.example.gateway_admin.Entities.GatewayRoute;
import com.example.gateway_admin.Services.GatewayRouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/gateway-routes")
public class GatewayRouteController {

    private final GatewayRouteService gatewayRouteService;

    public GatewayRouteController(GatewayRouteService gatewayRouteService) {
        this.gatewayRouteService = gatewayRouteService;
    }

    // GET all gateway routes
    @GetMapping
    public List<GatewayRoute> getAllRoutes() {
        return gatewayRouteService.getAllRoutes();
    }

    // GET a specific gateway route by id
    @GetMapping("/{id}")
    public ResponseEntity<GatewayRoute> getRouteById(@PathVariable Long id) {
        GatewayRoute route = gatewayRouteService.getRouteById(id);
        if (route == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(route);
    }

    // POST to create a new gateway route
    @PostMapping
    public GatewayRoute createRoute(@RequestBody GatewayRoute route) {
        return gatewayRouteService.createRoute(route);
    }

    // PUT to update an existing gateway route (full update)
    @PutMapping("/{id}")
    public ResponseEntity<GatewayRoute> updateRoute(@PathVariable Long id, @RequestBody GatewayRoute updatedRoute) {
        GatewayRoute existingRoute = gatewayRouteService.getRouteById(id);
        if (existingRoute == null) {
            return ResponseEntity.notFound().build();
        }
        // Overwrite the existing route with the new data.
        updatedRoute.setId(id);
        GatewayRoute savedRoute = gatewayRouteService.updateRoute(id, updatedRoute);
        return ResponseEntity.ok(savedRoute);
    }

    // PATCH to partially update an existing gateway route
    @PatchMapping("/{id}")
    public ResponseEntity<GatewayRoute> patchRoute(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        GatewayRoute existingRoute = gatewayRouteService.getRouteById(id);
        if (existingRoute == null) {
            return ResponseEntity.notFound().build();
        }

        // Update only the provided fields.
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


    // DELETE a gateway route by id
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
