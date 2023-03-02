import { FernVenusApi } from "@fern-api/venus-api-sdk";
import { BsDot } from "react-icons/bs";
import { useNumberOfApis } from "../useNumberOfApis";
import { useNumberOfEnvironments } from "../useNumberOfEnvironments";
import { LoadableArrayCount } from "./LoadableArrayCount";

export declare namespace OrganizationOverview {
    export interface Props {
        organization: FernVenusApi.Organization;
    }
}

export const OrganizationOverview: React.FC<OrganizationOverview.Props> = ({ organization }) => {
    const numApis = useNumberOfApis();
    const numEnvironments = useNumberOfEnvironments();

    return (
        <div className="flex-1 flex flex-col">
            <div className="text-4xl mb-2">{organization.organizationId}</div>
            <div className="flex items-center gap-1 text-gray-500">
                <LoadableArrayCount count={numApis} singularLabel="API" pluralLabel="APIs" />
                <BsDot />
                <LoadableArrayCount count={numEnvironments} singularLabel="environment" pluralLabel="environments" />
            </div>
        </div>
    );
};
