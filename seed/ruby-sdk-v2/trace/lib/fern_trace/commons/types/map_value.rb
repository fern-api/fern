# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class MapValue < Internal::Types::Model
        field :key_value_pairs, -> { Internal::Types::Array[FernTrace::Commons::Types::KeyValuePair] }, optional: false, nullable: false, api_name: "keyValuePairs"
      end
    end
  end
end
