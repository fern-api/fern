import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import classNames from "classnames";
import { ChevronRightIcon } from "../commons/icons/ChevronRightIcon";

export declare namespace HeaderPrimaryLink {
    export interface Props {
        navbarLink: FernRegistryDocsRead.NavbarLink.Primary;
    }
}

export const HeaderPrimaryLink: React.FC<HeaderPrimaryLink.Props> = ({ navbarLink }) => {
    return (
        <a
            className={classNames(
                "pl-4 pr-2.5 py-1.5 flex space-x-1.5 items-center !no-underline !text-accentPrimary transition rounded-full border border-accentPrimary/50 hover:border-accentPrimary bg-accentHighlight hover:bg-accentHighlight/20"
            )}
            href={navbarLink.url}
            rel="noreferrer noopener"
        >
            <span>{navbarLink.text}</span>
            <ChevronRightIcon className="h-3 w-3" />
        </a>
    );
};
