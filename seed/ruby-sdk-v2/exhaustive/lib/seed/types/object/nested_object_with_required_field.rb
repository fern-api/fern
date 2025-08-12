
module Seed
    module Types
        class NestedObjectWithRequiredField < Internal::Types::Model
            field :string, String, optional: false, nullable: false
            field :nested_object, Seed::types::object::ObjectWithOptionalField, optional: false, nullable: false
        end
    end
end
