
module Seed
    module Types
        class MyObjectWithOptional < Internal::Types::Model
            field :prop, , optional: false, nullable: false
            field :optional_prop, , optional: true, nullable: false
        end
    end
end
