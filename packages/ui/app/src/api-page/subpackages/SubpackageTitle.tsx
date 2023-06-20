import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { startCase } from "lodash-es";
import { useMemo } from "react";

export declare namespace SubpackageTitle {
    export interface Props {
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }
}

const SPLIT_VERSION_REGEX = / V (\d+)$/;

export const SubpackageTitle: React.FC<SubpackageTitle.Props> = ({ subpackage }) => {
    const title = useMemo(() => {
        let s = startCase(subpackage.name);

        const splitVersionMatch = s.match(SPLIT_VERSION_REGEX);

        if (splitVersionMatch?.[1] != null && splitVersionMatch.index != null) {
            const version = splitVersionMatch[1];
            s = s.slice(0, splitVersionMatch.index) + ` V${version}`;
        }

        return s;
    }, [subpackage.name]);

    return <>{title}</>;
};
