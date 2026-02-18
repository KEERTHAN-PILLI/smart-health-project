package com.smarthealth.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @GetMapping("/dashboard")
    public String userDashboard() {
        return "Welcome USER dashboard";
    }
    @GetMapping("/debug")
public Object debug(org.springframework.security.core.Authentication authentication) {
    return authentication.getAuthorities();
}

}
