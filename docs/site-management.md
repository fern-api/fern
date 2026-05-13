# Fern Sites Management

This system manages a registry of Fern documentation sites (`sites.csv`) with automated health checking and site discovery.

## Overview

The site management system combines three operations:

1. **Add sites from Vercel** - Discovers Fern sites deployed on Vercel
2. **Add sites from database** - Imports sites from your database
3. **Validate & Clean** - Checks all sites for health and removes inactive ones

All operations verify that domains host a live Fern site by calling `https://{domain}/api/fern-docs/health` before adding or keeping them in the registry.

## Files

- `sites.csv` - The site registry (domain, source, last_validated, status)
- `scripts/manage-sites.ts` - TypeScript script that performs site management operations
- `.github/workflows/manage-fern-sites.yml` - GitHub Actions workflow (runs daily)
- `domains-example.txt` - Example file format for manual domain addition

## Usage

### Manual Execution

```bash
# Run all operations (add from Vercel, add from DB, validate existing)
tsx scripts/manage-sites.ts all

# Add sites from Vercel only
tsx scripts/manage-sites.ts add-vercel

# Add sites from database only
tsx scripts/manage-sites.ts add-database

# Add sites from a file (one domain per line)
tsx scripts/manage-sites.ts add-file domains.txt

# Validate and clean existing sites only
tsx scripts/manage-sites.ts validate

# List all registered sites
tsx scripts/manage-sites.ts list
```

### GitHub Actions Workflow

The workflow runs automatically daily at 2 AM UTC, or can be triggered manually:

1. Go to Actions → Manage Fern Sites
2. Click "Run workflow"
3. Select the operation (default: "all")
4. Optionally provide a domains file path for manual addition

### Manual Domain Addition

Create a text file with one domain per line:

```text
# domains.txt
docs.example.com
api-docs.acme.com
developer.mycompany.io
```

Then run:

```bash
tsx scripts/manage-sites.ts add-file domains.txt
```

See `domains-example.txt` for a template.

## Configuration

### Required Secrets

Configure these in your repository settings (Settings → Secrets and variables → Actions):

- `VERCEL_TOKEN` - Vercel API token for accessing project data
  - Create at: https://vercel.com/account/tokens
  - Required scopes: Read projects

- `DATABASE_URL` (optional) - Database connection string
  - Format: `postgresql://user:password@host:port/database`
  - Or configure the database query in `scripts/manage-sites.ts`

### Health Check

Sites are validated by making an HTTP GET request to:
```
https://{domain}/api/fern-docs/health
```

A site is considered healthy if:
- The endpoint responds with status 2xx or 3xx
- Response is received within 10 seconds

## CSV Format

```csv
domain,source,last_validated,status
docs.example.com,vercel,2026-05-13T15:30:00.000Z,active
api.example.com,database,2026-05-13T15:30:00.000Z,active
```

Fields:
- `domain` - The domain name (without protocol)
- `source` - How the site was discovered (`vercel`, `database`, or `manual`)
- `last_validated` - ISO 8601 timestamp of last successful health check
- `status` - Current status (`active` or `inactive`)

## Customization

### Database Integration

To connect to your database, modify the `addSitesFromDatabase()` function in `scripts/manage-sites.ts`:

```typescript
// Example with PostgreSQL
import { Pool } from "pg";

async function addSitesFromDatabase(): Promise<void> {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const result = await pool.query("SELECT domain FROM fern_sites WHERE active = true");
    
    const existingSites = readSites();
    const existingDomains = new Set(existingSites.map((s) => s.domain));
    
    for (const row of result.rows) {
        const domain = row.domain;
        if (!existingDomains.has(domain)) {
            const isHealthy = await checkSiteHealth(domain);
            if (isHealthy) {
                existingSites.push({
                    domain,
                    source: "database",
                    last_validated: new Date().toISOString(),
                    status: "active",
                });
            }
        }
    }
    
    writeCsv(existingSites);
    await pool.end();
}
```

### Custom Health Check

Modify the `checkSiteHealth()` function to customize validation logic:

```typescript
async function checkSiteHealth(domain: string): Promise<boolean> {
    // Add custom logic here
    // e.g., check response body content, additional endpoints, etc.
}
```

## Workflow Schedule

The default schedule is daily at 2 AM UTC. To change this, modify the cron expression in `.github/workflows/manage-fern-sites.yml`:

```yaml
on:
  schedule:
    - cron: "0 2 * * *"  # Daily at 2 AM UTC
```

Examples:
- `"0 */6 * * *"` - Every 6 hours
- `"0 0 * * 0"` - Weekly on Sunday at midnight
- `"0 0 1 * *"` - Monthly on the 1st at midnight

## Monitoring

The workflow creates a summary after each run showing:
- Operation performed
- Success/failure status
- Whether sites.csv was updated
- Current total site count

View summaries in: Actions → Manage Fern Sites → [specific run] → Summary
