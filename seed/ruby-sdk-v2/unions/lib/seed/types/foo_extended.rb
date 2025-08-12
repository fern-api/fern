
module Seed
    module Types
        class FooExtended < Internal::Types::Model
            field :age, Integer, optional: false, nullable: false
        end
    end
end
