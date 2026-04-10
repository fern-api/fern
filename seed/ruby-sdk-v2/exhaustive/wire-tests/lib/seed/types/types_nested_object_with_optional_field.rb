# frozen_string_literal: true

module Seed
  module Types
    class TypesNestedObjectWithOptionalField < Internal::Types::Model
      field :string, -> { String }, optional: true, nullable: false
      field :nested_object, -> { Seed::Types::TypesObjectWithOptionalField }, optional: true, nullable: false, api_name: "NestedObject"
    end
  end
end
