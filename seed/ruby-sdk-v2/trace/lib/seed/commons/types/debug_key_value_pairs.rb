# frozen_string_literal: true

module Seed
  module Commons
    module Types
      class DebugKeyValuePairs < Internal::Types::Model
        field :key, -> { Seed::Commons::Types::DebugVariableValue }, optional: false, nullable: false
        field :value, -> { Seed::Commons::Types::DebugVariableValue }, optional: false, nullable: false
      end
    end
  end
end
