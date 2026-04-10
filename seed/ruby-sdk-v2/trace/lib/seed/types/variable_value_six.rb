# frozen_string_literal: true

module Seed
  module Types
    class VariableValueSix < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueSixType }, optional: false, nullable: false
      field :value, -> { Internal::Types::Array[Seed::Types::VariableValue] }, optional: true, nullable: false
    end
  end
end
