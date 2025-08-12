
module Seed
    module User
        class GetUsersRequest
            field :limit, , optional: false, nullable: false
            field :id, , optional: false, nullable: false
            field :date, , optional: false, nullable: false
            field :deadline, , optional: false, nullable: false
            field :bytes, , optional: false, nullable: false
            field :user, , optional: false, nullable: false
            field :user_list, , optional: false, nullable: false
            field :optional_deadline, , optional: true, nullable: false
            field :key_value, , optional: false, nullable: false
            field :optional_string, , optional: true, nullable: false
            field :nested_user, , optional: false, nullable: false
            field :optional_user, , optional: true, nullable: false
            field :exclude_user, , optional: false, nullable: false
            field :filter, , optional: false, nullable: false
        end
    end
end
