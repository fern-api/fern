import { assertNeverNoThrow } from "@fern-api/core-utils";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/serialization/resources/docs/resources/v1/resources/read";
import classNames from "classnames";

export declare namespace HeaderButton {
    export interface Props {
        navbarLink: FernRegistryDocsRead.NavbarLink.Raw;
    }
}

export const HeaderButton: React.FC<HeaderButton.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames("font-medium", getClassesForStyle(navbarLink.style))}
            href={navbarLink.url}
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </a>
    );
};

const DEFAULT_STYLE = "!text-accentPrimary/80 hover:!text-accentPrimary cursor-pointer transition";

function getClassesForStyle(style: FernRegistryDocsRead.NavbarLinkStyle.Raw): string {
    switch (style) {
        case "PRIMARY":
            return DEFAULT_STYLE;
        case "DEFAULT":
            return DEFAULT_STYLE;
        default:
            assertNeverNoThrow(style);
            return DEFAULT_STYLE;
    }
}
