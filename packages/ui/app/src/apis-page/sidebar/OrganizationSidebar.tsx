import { OrganizationMembers } from "./OrganizationMembers";

export const OrganizationSidebar: React.FC = () => {
    return (
        <div className="flex flex-1 bg-gray-200 p-8">
            <OrganizationMembers />
        </div>
    );
};
