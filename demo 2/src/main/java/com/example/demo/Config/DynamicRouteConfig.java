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
        // Returns a RouteLocator that reloads the routes from the database on each call.
        return new RouteLocator() {
            @Override
            public Flux<Route> getRoutes() {
                // Wrap the blocking call in Flux.defer and subscribe on a boundedElastic scheduler.
                return Flux.defer(() -> {
                    List<GatewayRoute> dbRoutes = routeRepository.findAll();
                    List<Route> routes = new ArrayList<>();
                    PathRoutePredicateFactory pathFactory = new PathRoutePredicateFactory();
                    for (GatewayRoute dbRoute : dbRoutes) {
                        PathRoutePredicateFactory.Config pathConfig = new PathRoutePredicateFactory.Config();
                        pathConfig.setPatterns(Collections.singletonList(dbRoute.getPredicates()));
                        Predicate<ServerWebExchange> pathPredicate = pathFactory.apply(pathConfig);

                        GatewayFilter ipFilter = ipFilterFactory.apply((Void) null);
                        GatewayFilter tokenFilter = tokenFilterFactory.apply((Void) null);
                        GatewayFilter rateFilter = rateLimitFactory.apply((Void) null);

                        Route.AsyncBuilder builder = Route.async()
                                .id(dbRoute.getRouteId())
                                .uri(dbRoute.getUri())
                                .predicate(pathPredicate);

                        if (Boolean.TRUE.equals(dbRoute.getWithIpFilter())) {
                            builder.filter(ipFilter);
                        }
                        if (Boolean.TRUE.equals(dbRoute.getWithToken())) {
                            builder.filter(tokenFilter);
                        }
                        builder.filter(rateFilter);
                        routes.add(builder.build());
                    }
                    return Flux.fromIterable(routes);
                }).subscribeOn(Schedulers.boundedElastic());
            }
        };
    }
}
