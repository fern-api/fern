import { ApiArtifactsTitle } from "../api-page/artifacts/ApiArtifactsTitle";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace ApiArtifactsSidebarItem {
    export interface Props {
        slug: string;
    }
}

export const ApiArtifactsSidebarItem: React.FC<ApiArtifactsSidebarItem.Props> = ({ slug }) => {
    return <NavigatingSidebarItem slug={slug} title={<ApiArtifactsTitle />} />;
};
