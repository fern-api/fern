# frozen_string_literal: true

module Seed
    module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
            field :string, String, optional: true, nullable: false
            field :nested_object, Seed::Types::Object_::ObjectWithOptionalField, optional: true, nullable: false

    end
end
