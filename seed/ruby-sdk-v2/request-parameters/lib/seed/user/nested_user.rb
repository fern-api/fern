
module Seed
    module Types
        class NestedUser < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :user, Seed::user::User, optional: false, nullable: false

    end
end
