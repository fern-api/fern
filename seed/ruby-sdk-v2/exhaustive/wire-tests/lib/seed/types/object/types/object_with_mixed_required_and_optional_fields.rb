# frozen_string_literal: true

module Seed
  module Types
    module Object_
      module Types
        # Tests that dynamic snippets include all required properties even when
        # the example data only provides a subset. In C#, properties marked as
        # `required` must be set in the object initializer.
        class ObjectWithMixedRequiredAndOptionalFields < Internal::Types::Model
          field :required_string, -> { String }, optional: false, nullable: false, api_name: "requiredString"
          field :required_integer, -> { Integer }, optional: false, nullable: false, api_name: "requiredInteger"
          field :optional_string, -> { String }, optional: true, nullable: false, api_name: "optionalString"
          field :required_long, -> { Integer }, optional: false, nullable: false, api_name: "requiredLong"
        end
      end
    end
  end
end
