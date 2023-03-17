import { Button, NonIdealState, Spinner } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { CenteredContent } from "@fern-api/common-components";
import { visitLoadable } from "@fern-api/loadable";
import { Header } from "../header/Header";
import { useCurrentOrganization } from "../queries/useOrganization";
import { ApisPageContextedFormDialogsProvider } from "./forms-context/context";
import { OrganizationOverview } from "./organization-overview/OrganizationOverview";
import { OrganizationSidebar } from "./sidebar/OrganizationSidebar";
import { OrganizationTabBarContextProvider } from "./tabs/context/OrganizationTabBarContextProvider";
import { OrganizationTabBar } from "./tabs/OrganizationTabBar";
import { OrganizationTabContent } from "./tabs/OrganizationTabContent";

export const ApisPage: React.FC = () => {
    const organization = useCurrentOrganization();

    return (
        <ApisPageContextedFormDialogsProvider>
            <div className="flex-1 flex flex-col min-h-0">
                <Header
                    centerContent={
                        organization.type === "loaded" ? (
                            <div className="flex gap-1">
                                <div>{organization.value.displayName}</div>
                                <Button icon={IconNames.CHEVRON_DOWN} minimal />
                            </div>
                        ) : undefined
                    }
                />
                {visitLoadable(organization, {
                    loaded: (loadedOrganization) => (
                        <div className="flex-1 flex min-h-0">
                            <div className="flex-1 flex flex-col">
                                <OrganizationTabBarContextProvider>
                                    <div>
                                        <CenteredContent fill>
                                            <div className="flex-1 flex flex-col">
                                                <div className="flex-1 flex flex-col pt-16">
                                                    <div className="flex-1 flex mb-10">
                                                        <OrganizationOverview organization={loadedOrganization} />
                                                    </div>
                                                </div>
                                                <OrganizationTabBar />
                                            </div>
                                        </CenteredContent>
                                    </div>
                                    <div className="h-px bg-gray-300 shrink-0" />
                                    <div className="flex-1 flex min-h-0">
                                        <CenteredContent scrollable fill>
                                            <OrganizationTabContent />
                                        </CenteredContent>
                                    </div>
                                </OrganizationTabBarContextProvider>
                            </div>
                            <div className="flex w-80">
                                <OrganizationSidebar />
                            </div>
                        </div>
                    ),
                    loading: () => <NonIdealState title={<Spinner />} />,
                    failed: () => <NonIdealState title="Failed to load organization" />,
                })}
            </div>
        </ApisPageContextedFormDialogsProvider>
    );
};
