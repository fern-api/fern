
module Seed
    module Types
        class DoubleOptional < Internal::Types::Model
            field :optional_alias, Array, optional: true, nullable: true
        end
    end
end
