import { H1 } from "@blueprintjs/core";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { ApiPackageContents } from "./ApiPackageContents";

export const ApiPage: React.FC = () => {
    const { apiDefinition, apiSection, apiSlug } = useApiDefinitionContext();

    return (
        <div className="min-h-0 overflow-y-auto pb-36">
            <H1 className="mb-10 px-24">{apiSection.title}</H1>
            <ApiPackageContents package={apiDefinition.rootPackage} slug={apiSlug} />
        </div>
    );
};
