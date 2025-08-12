
module Seed
    module Nullable
        class GetUsersRequest
            field :usernames, , optional: true, nullable: false
            field :avatar, , optional: true, nullable: false
            field :activated, , optional: true, nullable: false
            field :tags, , optional: true, nullable: false
            field :extra, , optional: true, nullable: false
        end
    end
end
