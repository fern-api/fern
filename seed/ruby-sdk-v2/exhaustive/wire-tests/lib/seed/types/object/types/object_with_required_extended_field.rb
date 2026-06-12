# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # Tests that a struct with a required field whose type extends a non-Default
        # base type does NOT incorrectly derive Default in Rust. Reproduces the bug
        # where namedTypeSupportsDefault only checked properties but not extends.
        class ObjectWithRequiredExtendedField < Internal::Types::Model
          field :required_extended, -> { Seed::Types::Object_::Types::ExtendedObjectWithInheritedEnum }, optional: false, nullable: false, api_name: "requiredExtended"
        end
      end
    end
  end
end
