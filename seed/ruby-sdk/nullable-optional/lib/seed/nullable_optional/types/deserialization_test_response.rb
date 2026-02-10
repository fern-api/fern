# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Response for deserialization test
      class DeserializationTestResponse < Internal::Types::Model
        field :echo, -> { Seed::NullableOptional::Types::DeserializationTestRequest }, optional: false, nullable: false
        field :processed_at, -> { String }, optional: false, nullable: false, api_name: "processedAt"
        field :null_count, -> { Integer }, optional: false, nullable: false, api_name: "nullCount"
        field :present_fields_count, -> { Integer }, optional: false, nullable: false, api_name: "presentFieldsCount"
      end
    end
  end
end
