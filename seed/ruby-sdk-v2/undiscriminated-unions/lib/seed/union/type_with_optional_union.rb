
module Seed
    module Types
        class TypeWithOptionalUnion < Internal::Types::Model
            field :my_union, Seed::union::MyUnion, optional: true, nullable: false

    end
end
