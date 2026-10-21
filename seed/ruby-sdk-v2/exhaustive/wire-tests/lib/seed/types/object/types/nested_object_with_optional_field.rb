# frozen_string_literal: true

require_relative "../../.."

module Seed
  module Types
    module Object_
      module Types
        class NestedObjectWithOptionalField < Internal::Types::Model
          field :string, -> { String }, optional: true, nullable: false

          field :nested_object, -> { Seed::Types::Object_::Types::ObjectWithOptionalField }, optional: true, nullable: false, api_name: "NestedObject"
        end
      end
    end
  end
end
