import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { BottomNavigationButtons } from "../bottom-navigation-buttons/BottomNavigationButtons";
import { ApiPackageContents } from "./ApiPackageContents";
import { ApiArtifacts } from "./artifacts/ApiArtifacts";
import { areApiArtifactsNonEmpty } from "./artifacts/areApiArtifactsNonEmpty";
import { ApiPageMargins } from "./page-margins/ApiPageMargins";

export const ApiPage: React.FC = () => {
    const { apiDefinition, apiSlug, apiSection } = useApiDefinitionContext();

    return (
        <div className="min-h-0 overflow-y-auto overflow-x-hidden pb-36">
            <ApiPageMargins>
                <div className="mt-20 pb-2 text-4xl font-medium">{apiSection.title}</div>
            </ApiPageMargins>
            {apiSection.artifacts != null && areApiArtifactsNonEmpty(apiSection.artifacts) && (
                <ApiArtifacts apiArtifacts={apiSection.artifacts} />
            )}
            <ApiPackageContents package={apiDefinition.rootPackage} slug={apiSlug} isLastInParentPackage={false} />
            <ApiPageMargins>
                <BottomNavigationButtons />
            </ApiPageMargins>
        </div>
    );
};
