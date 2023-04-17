import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { Subpackage } from "./definition/subpackages/Subpackage";
import { useResolvedUrlPath } from "./routes/useResolvedUrlPath";

export const ApiPageMainContent: React.FC = () => {
    const resolvedPath = useResolvedUrlPath();

    if (resolvedPath == null) {
        return <NonIdealState title="404" />;
    }

    switch (resolvedPath.type) {
        case "top-level-endpoint":
            return <NonIdealState title="Top-level endpoint" />;
        case "subpackage":
            return <Subpackage key={resolvedPath.subpackageId} subpackage={resolvedPath.subpackage} />;
        default:
            assertNever(resolvedPath);
    }
};
