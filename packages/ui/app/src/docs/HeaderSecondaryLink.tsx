import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";

export declare namespace HeaderSecondaryLink {
    export interface Props {
        navbarLink: FernRegistryDocsRead.NavbarLink.Secondary;
    }
}

export const HeaderSecondaryLink: React.FC<HeaderSecondaryLink.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames("!no-underline hover:!text-accentPrimary !text-text-stark transition")}
            href={navbarLink.url}
            rel="noreferrer noopener"
        >
            {navbarLink.text}
        </a>
    );
};
