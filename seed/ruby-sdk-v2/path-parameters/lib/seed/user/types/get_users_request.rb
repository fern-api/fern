
module Seed
    module User
        class GetUsersRequest
            field :tenant_id, String, optional: false, nullable: false
            field :user_id, String, optional: false, nullable: false
        end
    end
end
