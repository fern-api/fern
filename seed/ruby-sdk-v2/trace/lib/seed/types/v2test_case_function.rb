# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseFunction < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2TestCaseFunctionZero }
      member -> { Seed::Types::V2TestCaseFunctionOne }
    end
  end
end
