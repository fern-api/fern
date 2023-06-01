import { assertNeverNoThrow } from "@fern-api/core-utils";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";

export declare namespace HeaderButton {
    export interface Props {
        navbarLink: FernRegistryDocsRead.NavbarLink;
    }
}

export const HeaderButton: React.FC<HeaderButton.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames("", getClassesForStyle(navbarLink.style))}
            href={navbarLink.url}
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </a>
    );
};

const DEFAULT_STYLE = "!text-accentPrimary/80 hover:!text-accentPrimary cursor-pointer transition";

function getClassesForStyle(style: FernRegistryDocsRead.NavbarLinkStyle): string {
    switch (style) {
        case "PRIMARY":
            return "border-accentPrimary bg-accentHighlight !text-accentPrimary hover:bg-accentPrimary/20 cursor-pointer rounded-lg border px-4 py-2 transition";
        case "DEFAULT":
            return DEFAULT_STYLE;
        default:
            assertNeverNoThrow(style);
            return DEFAULT_STYLE;
    }
}
