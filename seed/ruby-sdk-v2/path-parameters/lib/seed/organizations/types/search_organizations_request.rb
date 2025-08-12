
module Seed
    module Organizations
        class SearchOrganizationsRequest
            field :tenant_id, , optional: false, nullable: false
            field :organization_id, , optional: false, nullable: false
            field :limit, , optional: true, nullable: false
        end
    end
end
