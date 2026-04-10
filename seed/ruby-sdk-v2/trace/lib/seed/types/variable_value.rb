# frozen_string_literal: true

module Seed
  module Types
    class VariableValue < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::VariableValueZero }
      member -> { Seed::Types::VariableValueOne }
      member -> { Seed::Types::VariableValueTwo }
      member -> { Seed::Types::VariableValueThree }
      member -> { Seed::Types::VariableValueFour }
      member -> { Seed::Types::VariableValueFive }
      member -> { Seed::Types::VariableValueSix }
      member -> { Seed::Types::VariableValueSeven }
      member -> { Seed::Types::VariableValueEight }
      member -> { Seed::Types::VariableValueNine }
      member -> { Seed::Types::VariableValueType }
    end
  end
end
