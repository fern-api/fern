# frozen_string_literal: true

module Seed
  module Types
    # Object inheriting from a nullable schema via allOf.
    class RootObject < Internal::Types::Model
      field :normal_field, -> { String }, optional: true, nullable: false, api_name: "normalField"

      field :nullable_field, -> { String }, optional: true, nullable: false, api_name: "nullableField"
    end
  end
end
