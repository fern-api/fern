# frozen_string_literal: true

module Seed
  module Types
    class DebugKeyValuePairs < Internal::Types::Model
      field :key, -> { Seed::Types::DebugVariableValue }, optional: false, nullable: false
      field :value, -> { Seed::Types::DebugVariableValue }, optional: false, nullable: false
    end
  end
end
