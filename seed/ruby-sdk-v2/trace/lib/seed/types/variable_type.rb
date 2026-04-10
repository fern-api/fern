# frozen_string_literal: true

module Seed
  module Types
    class VariableType < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::VariableTypeZero }
      member -> { Seed::Types::VariableTypeOne }
      member -> { Seed::Types::VariableTypeTwo }
      member -> { Seed::Types::VariableTypeThree }
      member -> { Seed::Types::VariableTypeFour }
      member -> { Seed::Types::VariableTypeFive }
      member -> { Seed::Types::VariableTypeSix }
      member -> { Seed::Types::VariableTypeSeven }
      member -> { Seed::Types::VariableTypeEight }
      member -> { Seed::Types::VariableTypeNine }
    end
  end
end
