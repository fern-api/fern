
module Seed
    module Types
        class DoubleOptional < Internal::Types::Model
            field :optional_alias, , optional: true, nullable: false
        end
    end
end
