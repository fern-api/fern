# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # Tests that dynamic snippets recursively construct default objects for
        # required properties whose type is a named object. The nested object's
        # own required properties should also be filled with defaults.
        class ObjectWithRequiredNestedObject < Internal::Types::Model
          field :required_string, -> { String }, optional: false, nullable: false, api_name: "requiredString"

          field :required_object, -> { Seed::Types::Object_::Types::NestedObjectWithRequiredField }, optional: false, nullable: false, api_name: "requiredObject"
        end
      end
    end
  end
end
