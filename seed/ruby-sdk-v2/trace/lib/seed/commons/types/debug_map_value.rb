# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class DebugMapValue < Internal::Types::Model
        field :key_value_pairs, lambda {
          Internal::Types::Array[Seed::Commons::Types::DebugKeyValuePairs]
        }, optional: false, nullable: false
      end
    end
  end
end
