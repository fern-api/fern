
module Seed
    module Types
        class NestedUser < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :user, , optional: false, nullable: false
        end
    end
end
