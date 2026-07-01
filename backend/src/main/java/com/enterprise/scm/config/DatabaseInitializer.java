package com.enterprise.scm.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class DatabaseInitializer implements CommandLineRunner {
    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitializer.class);

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @Override
    public void run(String... args) throws Exception {
        Integer count = 0;
        try {
            count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM users", Integer.class);
        } catch (Exception e) {
            logger.info("Users table does not exist or error checking it. Let Hibernate initialize schema first.");
            return;
        }

        if (count == null || count == 0) {
            logger.info("Database appears to be empty. Running data.sql seed script...");
            try {
                ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator(
                        false, false, "UTF-8", new ClassPathResource("data.sql")
                );
                resourceDatabasePopulator.execute(dataSource);
                logger.info("Database seeding completed successfully.");
            } catch (Exception e) {
                logger.error("Failed to seed database: {}", e.getMessage(), e);
            }
        } else {
            logger.info("Database already contains data ({} users found). Skipping seed.", count);
        }
    }
}
