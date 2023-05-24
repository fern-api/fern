import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { startCase } from "lodash-es";

export declare namespace SubpackageTitle {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }
}

export const SubpackageTitle: React.FC<SubpackageTitle.Props> = ({ subpackage }) => {
    return <>{startCase(subpackage.name)}</>;
};
