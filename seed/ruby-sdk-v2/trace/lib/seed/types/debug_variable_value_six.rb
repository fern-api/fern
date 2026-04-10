# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValueSix < Internal::Types::Model
      field :type, -> { Seed::Types::DebugVariableValueSixType }, optional: false, nullable: false
      field :value, -> { Internal::Types::Array[Seed::Types::DebugVariableValue] }, optional: true, nullable: false
    end
  end
end
