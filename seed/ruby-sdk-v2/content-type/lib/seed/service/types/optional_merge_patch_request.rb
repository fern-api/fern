# frozen_string_literal: true

module Seed
  module Service
    module Types
      class OptionalMergePatchRequest < Internal::Types::Model
        field :required_field, -> { String }, optional: false, nullable: false, api_name: "requiredField"
        field :optional_string, -> { String }, optional: true, nullable: false, api_name: "optionalString"
        field :optional_integer, -> { Integer }, optional: true, nullable: false, api_name: "optionalInteger"
        field :optional_boolean, lambda {
          Internal::Types::Boolean
        }, optional: true, nullable: false, api_name: "optionalBoolean"
        field :nullable_string, -> { String }, optional: false, nullable: true, api_name: "nullableString"
      end
    end
  end
end
