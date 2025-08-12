
module Seed
    module Types
        # Defines properties with default values and validation rules.
        class Type < Internal::Types::Model
            field :decimal, Integer, optional: false, nullable: false
            field :even, Integer, optional: false, nullable: false
            field :name, String, optional: false, nullable: false
            field :shape, Seed::Shape, optional: false, nullable: false
        end
    end
end
