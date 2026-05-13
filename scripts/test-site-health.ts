#!/usr/bin/env tsx
// Test script to verify Fern site health checking functionality

import * as https from "https";

const HEALTH_CHECK_PATH = "/api/fern-docs/health";
const REQUEST_TIMEOUT = 10000;

async function testHealthCheck(domain: string): Promise<void> {
    console.log(`Testing health check for: ${domain}`);
    console.log(`URL: https://${domain}${HEALTH_CHECK_PATH}`);
    
    const startTime = Date.now();
    
    return new Promise((resolve) => {
        const req = https.get(
            `https://${domain}${HEALTH_CHECK_PATH}`,
            {
                timeout: REQUEST_TIMEOUT,
                headers: {
                    "User-Agent": "Fern-Site-Manager-Test/1.0",
                },
            },
            (res) => {
                const duration = Date.now() - startTime;
                console.log(`Status: ${res.statusCode}`);
                console.log(`Duration: ${duration}ms`);
                
                const isHealthy = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400;
                console.log(`Result: ${isHealthy ? "✓ HEALTHY" : "✗ UNHEALTHY"}`);
                
                // Consume response data
                res.resume();
                resolve();
            }
        );

        req.on("error", (error) => {
            const duration = Date.now() - startTime;
            console.log(`Error: ${error.message}`);
            console.log(`Duration: ${duration}ms`);
            console.log("Result: ✗ UNHEALTHY (error)");
            resolve();
        });

        req.on("timeout", () => {
            const duration = Date.now() - startTime;
            req.destroy();
            console.log(`Duration: ${duration}ms`);
            console.log("Result: ✗ UNHEALTHY (timeout)");
            resolve();
        });
    });
}

async function main(): Promise<void> {
    const testDomains = process.argv.slice(2);
    
    if (testDomains.length === 0) {
        console.log("Fern Site Health Check Test\n");
        console.log("Usage: tsx scripts/test-site-health.ts <domain1> [domain2] [domain3] ...\n");
        console.log("Example:");
        console.log("  tsx scripts/test-site-health.ts docs.buildwithfern.com\n");
        process.exit(1);
    }

    console.log("=".repeat(60));
    console.log("Fern Site Health Check Test");
    console.log("=".repeat(60));
    console.log();

    for (let i = 0; i < testDomains.length; i++) {
        if (i > 0) {
            console.log("\n" + "-".repeat(60) + "\n");
        }
        
        await testHealthCheck(testDomains[i]);
    }

    console.log("\n" + "=".repeat(60));
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
