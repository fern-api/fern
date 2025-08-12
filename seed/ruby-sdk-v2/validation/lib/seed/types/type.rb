
module Seed
    module Types
        # Defines properties with default values and validation rules.
        class Type < Internal::Types::Model
            field :decimal, , optional: false, nullable: false
            field :even, , optional: false, nullable: false
            field :name, , optional: false, nullable: false
            field :shape, , optional: false, nullable: false
        end
    end
end
