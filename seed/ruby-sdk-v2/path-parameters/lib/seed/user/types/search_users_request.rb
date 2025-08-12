
module Seed
    module User
        class SearchUsersRequest
            field :tenant_id, , optional: false, nullable: false
            field :user_id, , optional: false, nullable: false
            field :limit, , optional: true, nullable: false
        end
    end
end
