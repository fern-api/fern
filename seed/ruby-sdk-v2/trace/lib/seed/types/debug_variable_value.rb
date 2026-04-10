# frozen_string_literal: true

module Seed
  module Types
    class DebugVariableValue < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::DebugVariableValueZero }
      member -> { Seed::Types::DebugVariableValueOne }
      member -> { Seed::Types::DebugVariableValueTwo }
      member -> { Seed::Types::DebugVariableValueThree }
      member -> { Seed::Types::DebugVariableValueFour }
      member -> { Seed::Types::DebugVariableValueFive }
      member -> { Seed::Types::DebugVariableValueSix }
      member -> { Seed::Types::DebugVariableValueSeven }
      member -> { Seed::Types::DebugVariableValueEight }
      member -> { Seed::Types::DebugVariableValueNine }
      member -> { Seed::Types::DebugVariableValueTen }
      member -> { Seed::Types::DebugVariableValueEleven }
      member -> { Seed::Types::DebugVariableValueTwelve }
    end
  end
end
