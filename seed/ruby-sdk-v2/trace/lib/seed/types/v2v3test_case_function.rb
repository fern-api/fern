# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseFunction < Internal::Types::Model
      extend Seed::Internal::Types::Union

      member -> { Seed::Types::V2V3TestCaseFunctionZero }
      member -> { Seed::Types::V2V3TestCaseFunctionOne }
    end
  end
end
