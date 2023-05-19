import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { ApiDefinitionContextProvider } from "./api-context/ApiDefinitionContextProvider";
import { ApiPageContents } from "./ApiPageContents";

export declare namespace ApiPage {
    export interface Props {
        apiDefinition: FernRegistryApiRead.ApiDefinition;
    }
}

export const ApiPage: React.FC<ApiPage.Props> = ({ apiDefinition }) => {
    return (
        <ApiDefinitionContextProvider api={apiDefinition}>
            <ApiPageContents />
        </ApiDefinitionContextProvider>
    );
};
