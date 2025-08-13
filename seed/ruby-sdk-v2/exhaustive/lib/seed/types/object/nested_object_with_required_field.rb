# frozen_string_literal: true

module Seed
    module Types
        class NestedObjectWithRequiredField < Internal::Types::Model
            field :string, String, optional: false, nullable: false
            field :nested_object, Seed::Types::Object_::ObjectWithOptionalField, optional: false, nullable: false

    end
end
