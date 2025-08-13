
module Seed
    module Types
        class UserPage < Internal::Types::Model
            field :data, Seed::users::UserListContainer, optional: false, nullable: false
            field :next_, String, optional: true, nullable: false

    end
end
