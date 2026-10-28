# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
  module Types
    module Object_
      module Types
        class NestedObjectWithRequiredField < Internal::Types::Model
          field :string, -> { String }, optional: false, nullable: false

          field :nested_object, -> { Seed::Types::Object_::Types::ObjectWithOptionalField }, optional: false, nullable: false, api_name: "NestedObject"
        end
      end
    end
  end
end
