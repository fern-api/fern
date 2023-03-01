import { NonIdealState, Spinner } from "@blueprintjs/core";
import { CenteredContent } from "@fern-api/common-components";
import { visitLoadable } from "@fern-api/loadable";
import { Header } from "../header/Header";
import { useAllApis } from "../queries/useAllApis";
import { ApiRow } from "./ApiRow";

export const ApisPage: React.FC = () => {
    const apis = useAllApis();

    return (
        <div className="flex-1 flex flex-col">
            <Header />
            {visitLoadable(apis, {
                loaded: (loadedApis) => (
                    <CenteredContent fill scrollable>
                        <div className="flex-1 flex flex-col">
                            <div className="text-4xl font-bold mt-10 mb-10">Your APIs</div>
                            <div className="flex flex-col gap-5 pb-10">
                                {loadedApis.apis.map((apiMetadata) => (
                                    <ApiRow key={apiMetadata.id} apiMetadata={apiMetadata} />
                                ))}
                            </div>
                        </div>
                    </CenteredContent>
                ),
                failed: () => <NonIdealState title="Failed to load" />,
                loading: () => <NonIdealState title={<Spinner />} />,
            })}
        </div>
    );
};
