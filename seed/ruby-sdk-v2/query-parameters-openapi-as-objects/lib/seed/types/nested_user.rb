
module Seed
    module Types
        class NestedUser < Internal::Types::Model
            field :name, String, optional: true, nullable: false
            field :user, Seed::User, optional: true, nullable: false

    end
end
