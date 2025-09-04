# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Response for deserialization test
      class DeserializationTestResponse < Internal::Types::Model
        field :echo, -> { Seed::NullableOptional::Types::DeserializationTestRequest }, optional: false, nullable: false
        field :processed_at, -> { String }, optional: false, nullable: false
        field :null_count, -> { Integer }, optional: false, nullable: false
        field :present_fields_count, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
