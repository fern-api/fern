import { NonIdealState, Spinner } from "@blueprintjs/core";
import { CenteredContent } from "@fern-api/common-components";
import { Header } from "../header/Header";
import { useAllApis } from "../queries/useAllApis";
import { ApiRow } from "./ApiRow";

export const ApisPage: React.FC = () => {
    const apis = useAllApis();

    if (apis.type !== "loaded") {
        return <NonIdealState title={<Spinner />} />;
    }

    return (
        <div className="flex-1 flex flex-col">
            <Header />
            <CenteredContent fill scrollable>
                <div className="flex-1 flex flex-col">
                    <div className="text-4xl font-bold mt-10 mb-10">Your APIs</div>
                    <div className="flex flex-col gap-5 pb-10">
                        {apis.value.apis.map((apiMetadata) => (
                            <ApiRow key={apiMetadata.id} apiMetadata={apiMetadata} />
                        ))}
                    </div>
                </div>
            </CenteredContent>
        </div>
    );
};
