
module Seed
    module Types
        class Dog < Internal::Types::Model
            field :name, , optional: false, nullable: false
            field :likes_to_woof, , optional: false, nullable: false
        end
    end
end
