# frozen_string_literal: true

module Seed
  module Types
    class DebugMapValue < Internal::Types::Model
      field :key_value_pairs, -> { Internal::Types::Array[Seed::Types::DebugKeyValuePairs] }, optional: false, nullable: false, api_name: "keyValuePairs"
    end
  end
end
