export interface ComparisonRules {
    ignore?: string[];
    normalize?: NormalizationRule[];
}

export interface NormalizationRule {
    pattern: string;
    replace: string;
}

export interface Difference {
    type: "missing-in-local" | "missing-in-remote" | "content-mismatch";
    file?: string;
    files?: string[];
    diff?: string;
}

export interface ComparisonResult {
    passed: boolean;
    differences: Difference[];
    summary: ComparisonSummary;
    report?: string;
}

export interface ComparisonSummary {
    totalFiles: number;
    identicalFiles: number;
    differentFiles: number;
    missingInLocal: number;
    missingInRemote: number;
}
