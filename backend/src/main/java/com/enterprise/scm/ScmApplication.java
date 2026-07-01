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
        configureDatabaseUrl();
        SpringApplication.run(ScmApplication.class, args);
    }

    private static void configureDatabaseUrl() {
        String dbUrl = System.getenv("DATABASE_URL");
        if (dbUrl != null && (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://"))) {
            try {
                String cleanUrl = dbUrl.replaceFirst("^postgres://", "postgresql://");
                java.net.URI uri = new java.net.URI(cleanUrl);
                String userInfo = uri.getUserInfo();
                if (userInfo != null && userInfo.contains(":")) {
                    String username = userInfo.split(":")[0];
                    String password = userInfo.split(":")[1];
                    String host = uri.getHost();
                    int port = uri.getPort();
                    if (port == -1) port = 5432;
                    String path = uri.getPath();
                    String query = uri.getQuery();

                    String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                    if (query != null) {
                        jdbcUrl += "?" + query;
                    } else {
                        jdbcUrl += "?sslmode=require";
                    }

                    System.setProperty("spring.datasource.url", jdbcUrl);
                    System.setProperty("spring.datasource.username", username);
                    System.setProperty("spring.datasource.password", password);
                    System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
                    
                    System.out.println("🔧 [DATABASE_URL Parsed] Configured spring.datasource URL: " + jdbcUrl);
                }
            } catch (Exception e) {
                System.err.println("❌ Failed to parse DATABASE_URL: " + e.getMessage());
            }
        }
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
