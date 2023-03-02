import { mapLoadableArray } from "@fern-api/loadable";
import { useAllApis } from "../../../queries/useAllApis";
import { ApiRow } from "./ApiRow";

export const ApisTab: React.FC = () => {
    const allApis = useAllApis();

    return (
        <div className="flex flex-col gap-4">
            {mapLoadableArray(allApis, (loadedApis) => loadedApis.apis).map((apiMetadata, index) => (
                <ApiRow key={index} apiMetadata={apiMetadata} />
            ))}
        </div>
    );
};
