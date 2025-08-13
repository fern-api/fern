
module Seed
    module Organizations
        class GetOrganizationUserRequest
            field :tenant_id, String, optional: false, nullable: false
            field :organization_id, String, optional: false, nullable: false
            field :user_id, String, optional: false, nullable: false

    end
end
