import { SeedTraceClient } from "../..";

async function main(): Promise<void> {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    
    await client.migration.getAttemptedMigrations({
        adminKeyHeader: "admin-key-header",
    });
}
main();
