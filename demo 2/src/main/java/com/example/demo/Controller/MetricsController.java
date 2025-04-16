package com.example.demo.Controller;

import com.example.demo.Filter.RequestCountFilter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MetricsController {

    @GetMapping("/api/metrics/requests")
    public long getRequestCount() {
        // Retrieve the count from the filter
        return RequestCountFilter.getRequestCount();
    }
}
