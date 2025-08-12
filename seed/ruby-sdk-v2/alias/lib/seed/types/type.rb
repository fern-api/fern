
module Seed
    module Types
        # A simple type with just a name.
        class Type < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
        end
    end
end
