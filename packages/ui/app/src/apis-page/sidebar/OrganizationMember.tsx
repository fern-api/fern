import { FernVenusApi } from "@fern-api/venus-api-sdk";

export declare namespace OrganizationMember {
    export interface Props {
        user: FernVenusApi.LightweightUser;
    }
}

export const OrganizationMember: React.FC<OrganizationMember.Props> = ({ user }) => {
    return (
        <div className="flex gap-3 items-center">
            <div
                className="w-10 h-10 rounded-full bg-contain bg-gray-300 border border-gray-300"
                style={
                    user.pictureUrl != null
                        ? {
                              backgroundImage: `url("${user.pictureUrl}")`,
                          }
                        : undefined
                }
            />
            <div>{user.displayName}</div>
        </div>
    );
};
