# frozen_string_literal: true

module Types
    module Types
        class NestedObjectWithRequiredField < Internal::Types::Model
            field :string, String, optional: true, nullable: true
            field :nested_object, ObjectWithOptionalField, optional: true, nullable: true
        end
    end
end
