
module Seed
    module User
        class GetUsersRequest
            field :tenant_id, , optional: false, nullable: false
            field :user_id, , optional: false, nullable: false
        end
    end
end
