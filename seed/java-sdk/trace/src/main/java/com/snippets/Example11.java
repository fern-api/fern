package com.snippets;

import com.seed.trace.SeedTraceClient;
import com.seed.trace.resources.migration.requests.GetAttemptedMigrationsRequest;

public class Example11 {
    public static void run() {
        SeedTraceClient client = SeedTraceClient
            .builder()
            .token("<token>")
            .url("https://api.fern.com")
            .build();

        client.migration().getAttemptedMigrations(
            GetAttemptedMigrationsRequest
                .builder()
                .adminKeyHeader("admin-key-header")
                .build()
        );
    }
}