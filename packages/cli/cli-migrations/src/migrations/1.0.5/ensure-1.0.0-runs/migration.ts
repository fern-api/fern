import { Migration } from "../../../types/Migration";

export const migration: Migration = {
    name: "ensure-1.0.0-migration-runs",
    summary:
        "Ensures 1.0.0 migration runs for users upgrading from pre-1.0.0 versions due to previous off-by-one error",
    run: async () => {
        // This is an empty migration that exists to trigger the 1.0.0 migration
        // for users who may have missed it due to an off-by-one error in the
        // migration system. By introducing this 1.0.5 migration, we ensure that
        // users upgrading to 1.0.5+ will have the 1.0.0 migration included in
        // their migration path.
    }
};
