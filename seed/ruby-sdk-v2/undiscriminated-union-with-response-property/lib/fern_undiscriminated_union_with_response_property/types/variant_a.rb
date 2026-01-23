# frozen_string_literal: true

module FernUndiscriminatedUnionWithResponseProperty
  module Types
    class VariantA < Internal::Types::Model
      field :type, -> { String }, optional: false, nullable: false
      field :value_a, -> { String }, optional: false, nullable: false, api_name: "valueA"
    end
  end
end
