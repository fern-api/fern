
module Seed
    module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
            field :string, , optional: true, nullable: false
            field :nested_object, , optional: true, nullable: false

    end
end
