# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseFunctionZero < Internal::Types::Model
      field :type, -> { Seed::Types::V2TestCaseFunctionZeroType }, optional: false, nullable: false
    end
  end
end
