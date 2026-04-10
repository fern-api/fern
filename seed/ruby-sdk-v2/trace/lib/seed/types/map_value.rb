# frozen_string_literal: true

module Seed
  module Types
    class MapValue < Internal::Types::Model
      field :key_value_pairs, -> { Internal::Types::Array[Seed::Types::KeyValuePair] }, optional: false, nullable: false, api_name: "keyValuePairs"
    end
  end
end
