package com.example.demo.Config;

import com.example.demo.Entity.GatewayRoute;
import com.example.demo.Filter.IpValidationGatewayFilterFactory;
import com.example.demo.Filter.SimpleRateLimitGatewayFilterFactory;
import com.example.demo.Filter.TokenValidationGatewayFilterFactory;
import com.example.demo.Repository.GatewayRouteRepository;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.handler.predicate.PathRoutePredicateFactory;
import org.springframework.cloud.gateway.route.Route;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.scheduler.Schedulers;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.function.Predicate;

@Configuration
public class DynamicRouteConfig {

    @Bean
    public RouteLocator customRouteLocator(
            GatewayRouteRepository routeRepository,
            IpValidationGatewayFilterFactory ipFilterFactory,
            TokenValidationGatewayFilterFactory tokenFilterFactory,
            SimpleRateLimitGatewayFilterFactory rateLimitFactory
    ) {
        return new RouteLocator() {
            @Override
            public Flux<Route> getRoutes() {
                return Flux.defer(() -> {
                    List<GatewayRoute> dbRoutes = routeRepository.findAll();
                    List<Route> routes = new ArrayList<>();
                    PathRoutePredicateFactory pathFactory = new PathRoutePredicateFactory();

                    for (GatewayRoute dbRoute : dbRoutes) {
                        // Ensure a valid route id is present.
                        String routeId = dbRoute.getRouteId();
                        if (routeId == null || routeId.trim().isEmpty()) {
                            routeId = "route-" + dbRoute.getId();
                        }

                        // Create the predicate using the stored pattern.
                        PathRoutePredicateFactory.Config pathConfig = new PathRoutePredicateFactory.Config();
                        pathConfig.setPatterns(Collections.singletonList(dbRoute.getPredicates()));
                        Predicate<ServerWebExchange> pathPredicate = pathFactory.apply(pathConfig);

                        // Obtain gateway filters.
                        GatewayFilter ipFilter = ipFilterFactory.apply((Void) null);
                        GatewayFilter tokenFilter = tokenFilterFactory.apply((Void) null);
                        GatewayFilter rateFilter = rateLimitFactory.apply((Void) null);

                        // Ensure the URI is valid.
                        String uri = dbRoute.getUri();
                        if (uri == null || uri.trim().isEmpty() || !uri.contains("://")) {
                            uri = "http://" + uri;
                        }

                        // Build the route and attach metadata for clarity.
                        Route.AsyncBuilder builder = Route.async()
                                .id(routeId)
                                .uri(uri)
                                .predicate(pathPredicate)
                                .metadata("withIpFilter", dbRoute.getWithIpFilter())
                                .metadata("withToken", dbRoute.getWithToken());

                        if (Boolean.TRUE.equals(dbRoute.getWithIpFilter())) {
                            builder.filter(ipFilter);
                        }
                        if (Boolean.TRUE.equals(dbRoute.getWithToken())) {
                            builder.filter(tokenFilter);
                        }
                        // Attach rate limiting filter regardless.
                        builder.filter(rateFilter);

                        routes.add(builder.build());
                    }

                    return Flux.fromIterable(routes);
                }).subscribeOn(Schedulers.boundedElastic());
            }
        };
    }
}
