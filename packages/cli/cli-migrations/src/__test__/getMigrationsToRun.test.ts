import { getMigrationsToRun } from "../migrations/getMigrationsToRun";

describe("getMigrationsToRun", () => {
    it("doesn't include to-version when no migration exists for it", () => {
        const migrationsToRun = getMigrationsToRun({ fromVersion: "0.0.150", toVersion: "0.0.188" });
        expect(migrationsToRun).toHaveLength(0);
    });

    it("includes to-version when a migration exists for it", () => {
        const migrationsToRun = getMigrationsToRun({ fromVersion: "0.0.190", toVersion: "0.0.191" });
        const allMigrations = migrationsToRun.flatMap(({ migrations }) => migrations);
        expect(allMigrations).toHaveLength(1);
        expect(migrationsToRun[0]?.version).toBe("0.0.191");
    });

    it("includes from-version", () => {
        const migrationsToRun = getMigrationsToRun({ fromVersion: "0.0.191", toVersion: "0.0.192" });
        const allMigrations = migrationsToRun.flatMap(({ migrations }) => migrations);
        expect(allMigrations).toHaveLength(1);
    });

    it("works with dev versions", () => {
        const migrationsToRun = getMigrationsToRun({
            fromVersion: "0.0.190-7-g2dd301a6",
            toVersion: "0.0.191-2-g9a7cba02"
        });
        const allMigrations = migrationsToRun.flatMap(({ migrations }) => migrations);
        expect(allMigrations).toHaveLength(1);
    });

    it("works with prod + dev versions", () => {
        const migrationsToRun = getMigrationsToRun({
            fromVersion: "0.0.194",
            toVersion: "0.0.194-4-gc1524d1b"
        });
        const allMigrations = migrationsToRun.flatMap(({ migrations }) => migrations);
        expect(allMigrations).toHaveLength(0);
    });

    it("includes 1.0.0 migration when upgrading to 1.0.0", () => {
        const migrationsToRun = getMigrationsToRun({ fromVersion: "0.54.0", toVersion: "1.0.0" });
        const allMigrations = migrationsToRun.flatMap(({ migrations }) => migrations);
        expect(allMigrations.length).toBeGreaterThan(0);
        const has1_0_0Migration = migrationsToRun.some((m) => m.version === "1.0.0");
        expect(has1_0_0Migration).toBe(true);
    });

    it("includes 1.0.0 migration when upgrading from 0.122.0 to 1.0.2", () => {
        const migrationsToRun = getMigrationsToRun({ fromVersion: "0.122.0", toVersion: "1.0.2" });
        const allMigrations = migrationsToRun.flatMap(({ migrations }) => migrations);
        expect(allMigrations.length).toBeGreaterThan(0);
        const has1_0_0Migration = migrationsToRun.some((m) => m.version === "1.0.0");
        expect(has1_0_0Migration).toBe(true);
    });
});
