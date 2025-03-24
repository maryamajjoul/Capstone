package com.example.demo.Db;

import org.springframework.http.server.reactive.ServerHttpRequest;
import java.net.InetSocketAddress;

public class IpUtils {

    public static String getClientIp(ServerHttpRequest request) {
        // Use the remote address of the client rather than the URI host.
        InetSocketAddress remoteAddress = request.getRemoteAddress();
        if (remoteAddress != null) {
            String ip = remoteAddress.getAddress().getHostAddress();
            System.out.println("Extracted client IP: " + ip);
            return normalizeLoopback(ip);
        }
        System.out.println("Extracted client IP: UNKNOWN");
        return "UNKNOWN";
    }

    /**
     * Normalizes various loopback forms to a standard representation.
     */
    private static String normalizeLoopback(String ip) {
        // Normalize IPv6 loopback addresses to the IPv4 loopback address.
        if ("::1".equals(ip) || "0:0:0:0:0:0:0:1".equals(ip)) {
            return "127.0.0.1";
        }
        // Normalize the hostname "localhost" to "127.0.0.1".
        if ("localhost".equalsIgnoreCase(ip)) {
            return "127.0.0.1";
        }
        return ip;
    }
}
