export type MigratorWarningType = "deprecated" | "unsupported" | "conflict" | "info";

export interface MigratorWarning {
    type: MigratorWarningType;
    message: string;
    suggestion?: string;
}
