import { Classes } from "@blueprintjs/core";
import { isLoaded } from "@fern-api/loadable";
import { useNavigateTo } from "@fern-api/routing-utils";
import classNames from "classnames";
import { generatePath } from "react-router-dom";
import { AccountMenu } from "../auth/AccountMenu";
import { LoginButton } from "../auth/LoginButton";
import { useCurrentUser } from "../auth/useCurrentUser";
import { FernLogo } from "../FernLogo";
import { FernRoutes } from "../routes";
import { useCurrentOrganizationIdOrThrow } from "../routes/useCurrentOrganization";

export declare namespace Header {
    export interface Props {
        centerContent?: JSX.Element;
    }
}

export const Header: React.FC<Header.Props> = ({ centerContent }) => {
    const currentUser = useCurrentUser();
    const currentOrganizationId = useCurrentOrganizationIdOrThrow();
    const onClickLogo = useNavigateTo(
        generatePath(FernRoutes.ORGANIZATION.absolutePath, {
            ORGANIZATION_ID: currentOrganizationId,
        })
    );

    return (
        <div className={classNames("flex text-white bg-[#131615] p-2", Classes.DARK)}>
            <div className="flex flex-1 items-center gap-2">
                <div className="cursor-pointer" onClick={onClickLogo}>
                    <FernLogo size={30} />
                </div>
            </div>
            <div className="flex flex-1 justify-center items-center text-lg">{centerContent}</div>
            <div className="flex flex-1 justify-end">
                {isLoaded(currentUser) &&
                    (currentUser.value != null ? <AccountMenu user={currentUser.value} /> : <LoginButton />)}
            </div>
        </div>
    );
};
