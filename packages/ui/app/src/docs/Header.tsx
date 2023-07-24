import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { HeaderPrimaryLink } from "./HeaderPrimaryLink";
import { HeaderSecondaryLink } from "./HeaderSecondaryLink";

export const Header: React.FC = () => {
    const { resolveFile, docsDefinition } = useDocsContext();
    const { logo, logoHref, navbarLinks } = docsDefinition.config;

    const hasLogo = logo != null;
    const hasLogoHref = logoHref != null;

    const logoContent = hasLogo && <img className="max-h-5" src={resolveFile(logo)} />;
    const logoSection = hasLogo && (
        <div className="flex max-h-full">
            {hasLogoHref ? (
                <a href={logoHref} className="flex items-center">
                    {logoContent}
                </a>
            ) : (
                <div className="flex items-center">{logoContent}</div>
            )}
        </div>
    );

    const navbarLinksSection = (
        <div className="flex items-center space-x-5 md:space-x-8">
            {navbarLinks.map((navbarLink, idx) =>
                visitDiscriminatedUnion(navbarLink, "type")._visit({
                    primary: (navbarLink) => <HeaderPrimaryLink key={idx} navbarLink={navbarLink} />,
                    secondary: (navbarLink) => <HeaderSecondaryLink key={idx} navbarLink={navbarLink} />,
                    _other: () => null,
                })
            )}
        </div>
    );

    return (
        <div
            className={classNames(
                "flex justify-between items-center shrink-0 py-4 pl-4 pr-4",
                // this matches with the calc() in the EndpointContent examples section
                "h-16"
            )}
        >
            {logoSection}
            {navbarLinksSection}
        </div>
    );
};
