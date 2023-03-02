import { OrganizationMembers } from "./OrganizationMembers";

export const OrganizationSidebar: React.FC = () => {
    return (
        <div className="flex flex-1 bg-[#f5f5f5] p-8">
            <OrganizationMembers />
        </div>
    );
};
