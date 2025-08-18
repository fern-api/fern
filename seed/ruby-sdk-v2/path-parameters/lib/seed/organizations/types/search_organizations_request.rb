
module Seed
    module Organizations
        class SearchOrganizationsRequest
            field :tenant_id, String, optional: false, nullable: false
            field :organization_id, String, optional: false, nullable: false
            field :limit, Integer, optional: true, nullable: false

    end
end
