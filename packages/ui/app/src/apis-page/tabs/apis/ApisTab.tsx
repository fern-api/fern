import { mapLoadableArray } from "@fern-api/loadable";
import { useAllApis } from "../../../queries/useAllApis";
import { ApiCard } from "./ApiCard";

export const ApisTab: React.FC = () => {
    const allApis = useAllApis();

    return (
        <div className="flex flex-col gap-12">
            {mapLoadableArray(allApis, (loadedApis) => loadedApis.apis, { numLoading: 1 }).map((apiMetadata, index) => (
                <ApiCard key={index} apiMetadata={apiMetadata} />
            ))}
        </div>
    );
};
