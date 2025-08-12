
module Seed
    module Types
        # A simple type with just a name.
        class Type < Internal::Types::Model
            field :name, , optional: false, nullable: false
        end
    end
end
