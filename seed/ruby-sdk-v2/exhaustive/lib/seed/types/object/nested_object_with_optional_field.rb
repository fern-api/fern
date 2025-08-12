
module Seed
    module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
            field :string, String, optional: true, nullable: false
            field :nested_object, Seed::types::object::ObjectWithOptionalField, optional: true, nullable: false
        end
    end
end
