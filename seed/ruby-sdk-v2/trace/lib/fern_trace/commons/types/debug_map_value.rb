# frozen_string_literal: true

module FernTrace
  module Commons
    module Types
      class DebugMapValue < Internal::Types::Model
        field :key_value_pairs, -> { Internal::Types::Array[FernTrace::Commons::Types::DebugKeyValuePairs] }, optional: false, nullable: false, api_name: "keyValuePairs"
      end
    end
  end
end
