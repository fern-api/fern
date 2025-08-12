
module Seed
    module Types
        class TypeWithOptionalUnion < Internal::Types::Model
            field :my_union, , optional: true, nullable: false
        end
    end
end
