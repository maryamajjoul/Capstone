package com.example.gateway_admin.Controller;

import com.example.gateway_admin.Entities.AllowedIps;
import com.example.gateway_admin.Repositories.AllowedIpRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/ip-addresses")
public class IpAddressController {

    private final AllowedIpRepository allowedIpRepository;

    public IpAddressController(AllowedIpRepository allowedIpRepository) {
        this.allowedIpRepository = allowedIpRepository;
    }

    // GET all IP addresses
    @GetMapping
    public List<AllowedIps> getAllIpAddresses() {
        return allowedIpRepository.findAll();
    }

    // GET a specific IP address by id
    @GetMapping("/{id}")
    public AllowedIps getIpAddressById(@PathVariable Long id) {
        return allowedIpRepository.findById(id).orElse(null);
    }

    // POST to create a new IP address
    @PostMapping
    public AllowedIps createIpAddress(@RequestBody AllowedIps ipAddress) {
        return allowedIpRepository.save(ipAddress);
    }

    // PUT to update an IP address
    @PutMapping("/{id}")
    public AllowedIps updateIpAddress(@PathVariable Long id, @RequestBody AllowedIps updatedIp) {
        updatedIp.setId(id);
        return allowedIpRepository.save(updatedIp);
    }

    // DELETE an IP address
    @DeleteMapping("/{id}")
    public void deleteIpAddress(@PathVariable Long id) {
        allowedIpRepository.deleteById(id);
    }
}
