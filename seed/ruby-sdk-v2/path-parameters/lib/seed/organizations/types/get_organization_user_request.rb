
module Seed
    module Organizations
        class GetOrganizationUserRequest
            field :tenant_id, , optional: false, nullable: false
            field :organization_id, , optional: false, nullable: false
            field :user_id, , optional: false, nullable: false
        end
    end
end
