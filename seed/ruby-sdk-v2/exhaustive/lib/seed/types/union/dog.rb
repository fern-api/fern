
module Seed
    module Types
        class Dog < Internal::Types::Model
            field :name, String, optional: false, nullable: false
            field :likes_to_woof, Internal::Types::Boolean, optional: false, nullable: false
        end
    end
end
