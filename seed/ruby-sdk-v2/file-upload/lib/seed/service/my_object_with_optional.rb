
module Seed
    module Types
        class MyObjectWithOptional < Internal::Types::Model
            field :prop, String, optional: false, nullable: false
            field :optional_prop, String, optional: true, nullable: false

    end
end
