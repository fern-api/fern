#!/usr/bin/env tsx

import * as fs from "fs";
import * as path from "path";
import * as https from "https";
import * as http from "http";

interface SiteRecord {
    domain: string;
    source: "vercel" | "database" | "manual";
    last_validated: string;
    status: "active" | "inactive";
}

const SITES_CSV_PATH = path.join(process.cwd(), "sites.csv");
const HEALTH_CHECK_PATH = "/api/fern-docs/health";
const REQUEST_TIMEOUT = 10000; // 10 seconds
const RATE_LIMIT_DELAY = 100; // milliseconds between requests

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkSiteHealth(domain: string, tryHttp = false): Promise<boolean> {
    return new Promise((resolve) => {
        const protocol = tryHttp ? "http" : "https";
        const url = `${protocol}://${domain}${HEALTH_CHECK_PATH}`;
        const client = tryHttp ? http : https;

        const req = client.get(
            url,
            {
                timeout: REQUEST_TIMEOUT,
                headers: {
                    "User-Agent": "Fern-Site-Manager/1.0",
                },
            },
            (res) => {
                // Consider 2xx and 3xx status codes as healthy
                const isHealthy = res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 400;
                
                // Consume response data to free up memory
                res.resume();
                
                resolve(isHealthy);
            }
        );

        req.on("error", async (error) => {
            // If HTTPS fails and we haven't tried HTTP yet, try HTTP
            if (!tryHttp && (error.message.includes("certificate") || error.message.includes("ENOTFOUND"))) {
                const httpResult = await checkSiteHealth(domain, true);
                resolve(httpResult);
            } else {
                resolve(false);
            }
        });

        req.on("timeout", () => {
            req.destroy();
            resolve(false);
        });
    });
}

async function checkSiteHealthWithRetry(domain: string, maxRetries = 2): Promise<boolean> {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const isHealthy = await checkSiteHealth(domain);
            if (isHealthy) {
                return true;
            }
            
            if (attempt < maxRetries) {
                await sleep(1000 * (attempt + 1)); // Exponential backoff
            }
        } catch (error) {
            if (attempt === maxRetries) {
                return false;
            }
        }
    }
    return false;
}

function parseCsv(content: string): SiteRecord[] {
    const lines = content.trim().split("\n");
    if (lines.length <= 1) {
        return [];
    }

    const records: SiteRecord[] = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const [domain, source, last_validated, status] = line.split(",");
        if (domain && source) {
            records.push({
                domain: domain.trim(),
                source: (source.trim() as SiteRecord["source"]) || "manual",
                last_validated: last_validated?.trim() || "",
                status: (status?.trim() as SiteRecord["status"]) || "active",
            });
        }
    }

    return records;
}

function writeCsv(records: SiteRecord[]): void {
    const header = "domain,source,last_validated,status";
    const rows = records.map(
        (record) => `${record.domain},${record.source},${record.last_validated},${record.status}`
    );
    const content = [header, ...rows].join("\n") + "\n";
    fs.writeFileSync(SITES_CSV_PATH, content, "utf-8");
}

function readSites(): SiteRecord[] {
    if (!fs.existsSync(SITES_CSV_PATH)) {
        return [];
    }
    const content = fs.readFileSync(SITES_CSV_PATH, "utf-8");
    return parseCsv(content);
}

async function addSitesFromVercel(): Promise<void> {
    console.log("Adding sites from Vercel...");

    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
        console.error("⚠️  VERCEL_TOKEN environment variable is not set");
        return;
    }

    try {
        const response = await fetch("https://api.vercel.com/v9/projects", {
            headers: {
                Authorization: `Bearer ${vercelToken}`,
            },
        });

        if (!response.ok) {
            console.error(`Vercel API error: ${response.status} ${response.statusText}`);
            return;
        }

        const data = (await response.json()) as { projects: Array<{ name?: string; targets?: { production?: { alias?: string[] } } }> };
        const existingSites = readSites();
        const existingDomains = new Set(existingSites.map((s) => s.domain));
        let addedCount = 0;
        let skippedCount = 0;
        let checkedCount = 0;

        console.log(`Found ${data.projects.length} Vercel projects`);

        for (const project of data.projects) {
            const domains = project.targets?.production?.alias || [];
            for (const domain of domains) {
                if (!existingDomains.has(domain)) {
                    checkedCount++;
                    console.log(`[${checkedCount}] Checking: ${domain}`);
                    
                    const isHealthy = await checkSiteHealthWithRetry(domain);
                    
                    if (isHealthy) {
                        existingSites.push({
                            domain,
                            source: "vercel",
                            last_validated: new Date().toISOString(),
                            status: "active",
                        });
                        existingDomains.add(domain);
                        addedCount++;
                        console.log(`   ✓ Added (project: ${project.name || "unknown"})`);
                    } else {
                        skippedCount++;
                        console.log(`   ✗ Skipped - no healthy Fern site`);
                    }
                    
                    // Rate limiting
                    await sleep(RATE_LIMIT_DELAY);
                }
            }
        }

        if (addedCount > 0) {
            writeCsv(existingSites);
        }
        
        console.log(`\nVercel Summary: Checked ${checkedCount}, Added ${addedCount}, Skipped ${skippedCount}`);
    } catch (error) {
        console.error("Error fetching sites from Vercel:", error);
    }
}

async function addSitesFromDatabase(): Promise<void> {
    console.log("Adding sites from database...");

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error("⚠️  DATABASE_URL environment variable is not set");
        console.log("ℹ️  To enable database integration:");
        console.log("   1. Set DATABASE_URL environment variable");
        console.log("   2. Install database driver: npm install pg (for PostgreSQL)");
        console.log("   3. Implement the query logic in scripts/manage-sites.ts");
        return;
    }

    try {
        console.log("⚠️  Database integration placeholder");
        console.log("ℹ️  To complete database integration, modify addSitesFromDatabase()");
        console.log("   See docs/site-management.md for examples");

        // Example implementation structure:
        // 
        // import { Pool } from "pg";
        // 
        // const pool = new Pool({ connectionString: dbUrl });
        // const result = await pool.query(`
        //     SELECT DISTINCT domain 
        //     FROM fern_documentation_sites 
        //     WHERE status = 'active' 
        //     ORDER BY domain
        // `);
        // 
        // const existingSites = readSites();
        // const existingDomains = new Set(existingSites.map((s) => s.domain));
        // let addedCount = 0;
        // 
        // for (const row of result.rows) {
        //     const domain = row.domain;
        //     if (!existingDomains.has(domain)) {
        //         const isHealthy = await checkSiteHealthWithRetry(domain);
        //         if (isHealthy) {
        //             existingSites.push({
        //                 domain,
        //                 source: "database",
        //                 last_validated: new Date().toISOString(),
        //                 status: "active",
        //             });
        //             addedCount++;
        //         }
        //         await sleep(RATE_LIMIT_DELAY);
        //     }
        // }
        // 
        // if (addedCount > 0) {
        //     writeCsv(existingSites);
        // }
        // console.log(`Database Summary: Added ${addedCount} sites`);
        // await pool.end();
        
    } catch (error) {
        console.error("Error fetching sites from database:", error);
    }
}

async function validateAndCleanSites(): Promise<void> {
    console.log("Validating and cleaning sites...");

    const sites = readSites();
    
    if (sites.length === 0) {
        console.log("No sites to validate");
        return;
    }
    
    const validatedSites: SiteRecord[] = [];
    const removedSites: string[] = [];
    let healthyCount = 0;

    console.log(`Validating ${sites.length} sites...\n`);

    for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        console.log(`[${i + 1}/${sites.length}] Checking: ${site.domain}`);
        
        const isHealthy = await checkSiteHealthWithRetry(site.domain);

        if (isHealthy) {
            validatedSites.push({
                ...site,
                last_validated: new Date().toISOString(),
                status: "active",
            });
            healthyCount++;
            console.log(`   ✓ Healthy (source: ${site.source})`);
        } else {
            removedSites.push(site.domain);
            console.log(`   ✗ Unhealthy - will be removed`);
        }
        
        // Rate limiting
        await sleep(RATE_LIMIT_DELAY);
    }

    writeCsv(validatedSites);
    
    console.log(`\nValidation Summary:`);
    console.log(`  Total checked: ${sites.length}`);
    console.log(`  Healthy: ${healthyCount}`);
    console.log(`  Removed: ${removedSites.length}`);
    
    if (removedSites.length > 0) {
        console.log(`\nRemoved sites:`);
        removedSites.forEach((domain) => console.log(`  - ${domain}`));
    }
}

async function addManualSites(filePath: string): Promise<void> {
    console.log(`Adding sites from file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return;
    }

    try {
        const content = fs.readFileSync(filePath, "utf-8");
        const domains = content
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith("#"));

        const existingSites = readSites();
        const existingDomains = new Set(existingSites.map((s) => s.domain));
        let addedCount = 0;
        let skippedCount = 0;

        console.log(`Found ${domains.length} domains to check\n`);

        for (let i = 0; i < domains.length; i++) {
            const domain = domains[i];
            
            if (existingDomains.has(domain)) {
                console.log(`[${i + 1}/${domains.length}] ${domain}: Already exists`);
                continue;
            }

            console.log(`[${i + 1}/${domains.length}] Checking: ${domain}`);
            const isHealthy = await checkSiteHealthWithRetry(domain);

            if (isHealthy) {
                existingSites.push({
                    domain,
                    source: "manual",
                    last_validated: new Date().toISOString(),
                    status: "active",
                });
                existingDomains.add(domain);
                addedCount++;
                console.log(`   ✓ Added`);
            } else {
                skippedCount++;
                console.log(`   ✗ Skipped - no healthy Fern site`);
            }

            await sleep(RATE_LIMIT_DELAY);
        }

        if (addedCount > 0) {
            writeCsv(existingSites);
        }

        console.log(`\nManual Import Summary: Added ${addedCount}, Skipped ${skippedCount}`);
    } catch (error) {
        console.error("Error reading file:", error);
    }
}

async function listSites(): Promise<void> {
    const sites = readSites();
    
    if (sites.length === 0) {
        console.log("No sites in registry");
        return;
    }

    console.log(`Total sites: ${sites.length}\n`);

    const bySource = sites.reduce(
        (acc, site) => {
            acc[site.source] = (acc[site.source] || 0) + 1;
            return acc;
        },
        {} as Record<string, number>
    );

    console.log("By source:");
    Object.entries(bySource).forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`);
    });

    console.log("\nSites:");
    sites.forEach((site, i) => {
        console.log(`${i + 1}. ${site.domain} (${site.source}, ${site.status})`);
    });
}

async function main(): Promise<void> {
    const command = process.argv[2];
    const arg = process.argv[3];

    switch (command) {
        case "add-vercel":
            await addSitesFromVercel();
            break;
        case "add-database":
            await addSitesFromDatabase();
            break;
        case "add-file":
            if (!arg) {
                console.error("Error: File path required");
                console.error("Usage: manage-sites.ts add-file <path-to-domains.txt>");
                process.exit(1);
            }
            await addManualSites(arg);
            break;
        case "validate":
            await validateAndCleanSites();
            break;
        case "list":
            await listSites();
            break;
        case "all":
            console.log("Running all site management tasks...\n");
            await addSitesFromVercel();
            console.log("\n" + "=".repeat(60) + "\n");
            await addSitesFromDatabase();
            console.log("\n" + "=".repeat(60) + "\n");
            await validateAndCleanSites();
            break;
        default:
            console.log("Fern Sites Management Tool");
            console.log("\nUsage: manage-sites.ts <command> [arguments]");
            console.log("\nCommands:");
            console.log("  add-vercel           Add sites from Vercel");
            console.log("  add-database         Add sites from database");
            console.log("  add-file <path>      Add sites from a text file (one domain per line)");
            console.log("  validate             Validate and clean existing sites");
            console.log("  list                 List all registered sites");
            console.log("  all                  Run all operations (add-vercel, add-database, validate)");
            console.log("\nEnvironment Variables:");
            console.log("  VERCEL_TOKEN         Required for add-vercel");
            console.log("  DATABASE_URL         Required for add-database");
            console.log("\nExamples:");
            console.log("  tsx scripts/manage-sites.ts all");
            console.log("  tsx scripts/manage-sites.ts add-file domains.txt");
            console.log("  tsx scripts/manage-sites.ts validate");
            console.log("  tsx scripts/manage-sites.ts list");
            process.exit(command ? 1 : 0);
    }
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
