package com.enterprise.scm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableCaching
@EnableScheduling
public class ScmApplication {
    public static void main(String[] args) {
        SpringApplication.run(ScmApplication.class, args);
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    public void onApplicationReady() {
        System.out.println("\n" +
                "========================================================================\n" +
                "  🚀 [BACKEND RUNNING & CONNECTED SUCCESSFULLY] \n" +
                "  👉 API Base URL: http://localhost:8080/api\n" +
                "  👉 Database: H2 in-memory (http://localhost:8080/api/h2-console)\n" +
                "========================================================================\n");
    }
}
