# frozen_string_literal: true

module Seed
  module Types
    class StreamXFernStreamingNullableConditionRequest < Internal::Types::Model
      field :query, -> { String }, optional: false, nullable: false
      field :stream, -> { Internal::Types::Boolean }, optional: false, nullable: false
    end
  end
end
