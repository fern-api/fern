import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { MobileSidebar } from "../mobile-sidebar/MobileSidebar";
import { Sidebar } from "../sidebar/Sidebar";
import { BrandGradient } from "./BrandGradient";
import { DocsMainContent } from "./DocsMainContent";
import { Header } from "./Header";
import { useCustomTheme } from "./useCustomTheme";

export const Docs: React.FC = () => {
    const { docsDefinition } = useDocsContext();
    useCustomTheme(docsDefinition);

    return (
        <div className="relative flex min-h-0 flex-1 flex-col bg-cover">
            <div className="border-border bg-background sticky inset-x-0 top-0 border-b">
                <Header />
                <div className="flex md:hidden">
                    <MobileSidebar />
                </div>
            </div>
            <div className="flex min-h-0 flex-1">
                <div className={classNames("w-64", "hidden md:flex")}>
                    <Sidebar />
                </div>
                <div className="relative flex min-w-0 flex-1 flex-col">
                    <BrandGradient size="700px" position="1200px 400px" />
                    <BrandGradient size="300px" position="-5% 105%" />
                    <div className="z-10 flex min-h-0 min-w-0 flex-1 flex-col">
                        <DocsMainContent />
                    </div>
                </div>
            </div>
        </div>
    );
};
