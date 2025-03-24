package com.example.demo.Filter;

import com.example.demo.Db.IpUtils;
import com.example.demo.Entity.AllowedIp;
import com.example.demo.Entity.GatewayRoute;
import com.example.demo.Repository.GatewayRouteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;

@Slf4j
@Component
public class IpValidationGatewayFilterFactory extends AbstractGatewayFilterFactory<Void> {

    private final GatewayRouteRepository gatewayRouteRepository;

    @Autowired
    public IpValidationGatewayFilterFactory(GatewayRouteRepository gatewayRouteRepository) {
        super(Void.class);
        this.gatewayRouteRepository = gatewayRouteRepository;
    }

    @Override
    public GatewayFilter apply(Void unused) {
        return (exchange, chain) -> {
            // 1) Extract the request path from the incoming request.
            String requestPath = exchange.getRequest().getURI().getPath();
            log.info("IP Validation Filter: requestPath={}", requestPath);

            // 2) Retrieve all routes from the database.
            List<GatewayRoute> allRoutes = gatewayRouteRepository.findAll();
            log.debug("All routes loaded from DB ({} total):", allRoutes.size());
            for (GatewayRoute r : allRoutes) {
                log.debug(" - routeId={}, predicates={}, withIpFilter={}",
                        r.getRouteId(), r.getPredicates(), r.getWithIpFilter());
            }

            // 3) Sort routes so that the longest predicate is checked first (longest match wins).
            allRoutes.sort((r1, r2) -> {
                String p1 = r1.getPredicates().endsWith("/**")
                        ? r1.getPredicates().substring(0, r1.getPredicates().length() - 3)
                        : r1.getPredicates();
                String p2 = r2.getPredicates().endsWith("/**")
                        ? r2.getPredicates().substring(0, r2.getPredicates().length() - 3)
                        : r2.getPredicates();
                return Integer.compare(p2.length(), p1.length());
            });

            // 4) Dynamically find the matching route by comparing the request path with each route's predicate.
            GatewayRoute matchingRoute = null;
            for (GatewayRoute route : allRoutes) {
                String predicate = route.getPredicates();
                // Normalize predicate pattern, e.g. remove trailing "/**" if present.
                if (predicate.endsWith("/**")) {
                    predicate = predicate.substring(0, predicate.length() - 3);
                }
                if (requestPath.startsWith(predicate)) {
                    matchingRoute = route;
                    break;
                }
            }

            // 5) If no matching route is found, log and return a 404 response.
            if (matchingRoute == null) {
                log.warn("No matching route pattern found for path: {}", requestPath);
                exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
                return exchange.getResponse().setComplete();
            }

            log.info("Found matching route: routeId={}, predicates={}, withIpFilter={}",
                    matchingRoute.getRouteId(), matchingRoute.getPredicates(), matchingRoute.getWithIpFilter());

            // 6) If IP filtering is disabled for the route, pass the request along.
            if (!Boolean.TRUE.equals(matchingRoute.getWithIpFilter())) {
                log.info("IP filtering is disabled for routeId={}. Passing request along.", matchingRoute.getRouteId());
                return chain.filter(exchange);
            }

            // 7) Retrieve the list of allowed IPs from the matching route.
            List<AllowedIp> allowedIpList = matchingRoute.getAllowedIps();
            if (allowedIpList == null || allowedIpList.isEmpty()) {
                log.error("No allowed IPs set for routeId={}. Returning 403.", matchingRoute.getRouteId());
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }
            log.info("Allowed IPs for routeId={}: {}", matchingRoute.getRouteId(), allowedIpList);

            // 8) Extract the client IP using IpUtils.
            ServerHttpRequest request = exchange.getRequest();
            String clientIp = IpUtils.getClientIp(request);
            log.info("Client IP extracted: {}", clientIp);

            // 9) Check if the client IP is in the allowed list.
            boolean isAllowed = allowedIpList.stream()
                    .anyMatch(ipEntity -> ipEntity != null && clientIp.equals(ipEntity.getIp()));

            if (isAllowed) {
                log.info("IP {} is allowed for routeId={}", clientIp, matchingRoute.getRouteId());
                return chain.filter(exchange);
            } else {
                log.warn("Access DENIED for IP {} on routeId={}", clientIp, matchingRoute.getRouteId());
                exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);
                return exchange.getResponse().setComplete();
            }
        };
    }
}
