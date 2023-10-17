import { RelativeFilePath } from "@fern-api/fs-utils";
import {
    NodePath,
    PackageMarkerAstNodeTypes,
    PackageMarkerAstNodeVisitor,
    PackageMarkerAstVisitor,
    PackageMarkerFileSchema
} from "@fern-api/yaml-schema";
import { RuleVisitors } from "./Rule";
import { ValidationViolation } from "./ValidationViolation";

export function createPackageMarkerAstVisitorForRules({
    relativeFilepath,
    contents,
    allRuleVisitors,
    addViolations,
}: {
    relativeFilepath: RelativeFilePath;
    contents: PackageMarkerFileSchema;
    allRuleVisitors: RuleVisitors[];
    addViolations: (newViolations: ValidationViolation[]) => void;
}): PackageMarkerAstVisitor {
    function createAstNodeVisitor<K extends keyof PackageMarkerAstNodeTypes>(
        nodeType: K
    ): Record<K, PackageMarkerAstNodeVisitor<K>> {
        const visit: PackageMarkerAstNodeVisitor<K> = async (
            node: PackageMarkerAstNodeTypes[K],
            nodePath: NodePath
        ) => {
            for (const ruleVisitors of allRuleVisitors) {
                const visitFromRule = ruleVisitors.packageMarker?.[nodeType];
                if (visitFromRule != null) {
                    const ruleViolations = await visitFromRule(node, { relativeFilepath, contents });
                    addViolations(
                        ruleViolations.map((violation) => ({
                            severity: violation.severity,
                            relativeFilepath,
                            nodePath,
                            message: violation.message,
                        }))
                    );
                }
            }
        };

        return { [nodeType]: visit } as Record<K, PackageMarkerAstNodeVisitor<K>>;
    }

    return {
        ...createAstNodeVisitor("export"),
        ...createAstNodeVisitor("navigation"),
    };
}
