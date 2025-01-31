import { PackageMarkerFileSchema } from "@fern-api/fern-definition-schema";
import { RelativeFilePath } from "@fern-api/fs-utils";
import { NodePath } from "@fern-api/validation-utils";

import { ValidationViolation } from "@fern-api/validation-utils";
import { PackageMarkerAstNodeTypes, PackageMarkerAstNodeVisitor, PackageMarkerAstVisitor } from "./ast";
import { RuleVisitors } from "./Rule";

export function createPackageMarkerAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations
}: {
    relativeFilepath: RelativeFilePath;
    contents: PackageMarkerFileSchema;
    allRuleVisitors: RuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): PackageMarkerAstVisitor {
    function createAstNodeVisitor<K extends keyof PackageMarkerAstNodeTypes>(
        nodeType: K
    ): Record<K, PackageMarkerAstNodeVisitor<K>> {
        const visit: PackageMarkerAstNodeVisitor<K> = (node: PackageMarkerAstNodeTypes[K], nodePath: NodePath) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors.packageMarker?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = visitFromRule(node, { relativeFilepath, contents });
                    addViolations(
                        ruleViolations.map((violation) => ({
                            severity: violation.severity,
                            relativeFilepath,
                            nodePath,
                            message: violation.message
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, PackageMarkerAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("export"),
        ...createAstNodeVisitor("navigation")
    };
}
