
module Seed
    module Types
        class NestedUser < Internal::Types::Model
            field :name, , optional: true, nullable: false
            field :user, , optional: true, nullable: false
        end
    end
end
