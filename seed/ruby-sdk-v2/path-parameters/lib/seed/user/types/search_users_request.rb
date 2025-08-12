
module Seed
    module User
        class SearchUsersRequest
            field :tenant_id, String, optional: false, nullable: false
            field :user_id, String, optional: false, nullable: false
            field :limit, Integer, optional: true, nullable: false
        end
    end
end
