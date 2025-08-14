
module Seed
    module User
        class GetUsersRequest
            field :limit, Integer, optional: false, nullable: false
            field :id, String, optional: false, nullable: false
            field :date, String, optional: false, nullable: false
            field :deadline, String, optional: false, nullable: false
            field :bytes, String, optional: false, nullable: false
            field :user, Seed::User::User, optional: false, nullable: false
            field :user_list, Internal::Types::Array[Seed::User::User], optional: false, nullable: false
            field :optional_deadline, String, optional: true, nullable: false
            field :key_value, Internal::Types::Hash[String, String], optional: false, nullable: false
            field :optional_string, String, optional: true, nullable: false
            field :nested_user, Seed::User::NestedUser, optional: false, nullable: false
            field :optional_user, Seed::User::User, optional: true, nullable: false
            field :exclude_user, Seed::User::User, optional: false, nullable: false
            field :filter, String, optional: false, nullable: false
            field :long_param, Integer, optional: false, nullable: false
            field :big_int_param, String, optional: false, nullable: false

    end
end
