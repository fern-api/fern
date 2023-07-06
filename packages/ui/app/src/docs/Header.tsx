import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { HeaderButton } from "./HeaderButton";

export const Header: React.FC = () => {
    const { resolveFile, docsDefinition } = useDocsContext();
    const { logo, logoHref, navbarLinks } = docsDefinition.config;

    const hasLogo = !!logo;
    const hasLogoHref = !!logoHref;

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
        <div className="flex items-center gap-5">
            {navbarLinks.map((navbarLink, i) => (
                <HeaderButton key={i} navbarLink={navbarLink} />
            ))}
        </div>
    );

    return (
        <div
            className={classNames(
                "flex justify-between items-center gap-10 shrink-0 py-4 pl-4 pr-20",
                // this matches with the calc() in the EndpointContent examples section
                "h-16"
            )}
        >
            {logoSection}
            {navbarLinksSection}
        </div>
    );
};
