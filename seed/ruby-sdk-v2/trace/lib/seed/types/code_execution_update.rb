# frozen_string_literal: true

module Seed
  module Types
    class CodeExecutionUpdate < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::CodeExecutionUpdateZero }
      member -> { Seed::Types::CodeExecutionUpdateOne }
      member -> { Seed::Types::CodeExecutionUpdateTwo }
      member -> { Seed::Types::CodeExecutionUpdateThree }
      member -> { Seed::Types::CodeExecutionUpdateFour }
      member -> { Seed::Types::CodeExecutionUpdateFive }
      member -> { Seed::Types::CodeExecutionUpdateSix }
      member -> { Seed::Types::CodeExecutionUpdateSeven }
      member -> { Seed::Types::CodeExecutionUpdateEight }
      member -> { Seed::Types::CodeExecutionUpdateNine }
      member -> { Seed::Types::CodeExecutionUpdateTen }
    end
  end
end
