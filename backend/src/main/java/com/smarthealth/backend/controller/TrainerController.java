package com.smarthealth.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trainer")
public class TrainerController {

    @GetMapping("/dashboard")
    public String trainerDashboard() {
        return "Welcome TRAINER dashboard";
    }
}
