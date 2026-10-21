# frozen_string_literal: true

require_relative "../.."

module Seed
  module Commons
    module Types
      class DebugMapValue < Internal::Types::Model
        field :key_value_pairs, -> { Internal::Types::Array[Seed::Commons::Types::DebugKeyValuePairs] }, optional: false, nullable: false, api_name: "keyValuePairs"
      end
    end
  end
end
