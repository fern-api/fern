
module Seed
    module Types
        # A simple type with just a name.
        class Type < Internal::Types::Model
            field :id, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
        end
    end
end
