
module Seed
    module Types
        class UserListContainer < Internal::Types::Model
            field :users, Internal::Types::Array[Seed::users::User], optional: false, nullable: false

    end
end
