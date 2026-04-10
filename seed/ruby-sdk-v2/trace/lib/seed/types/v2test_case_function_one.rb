# frozen_string_literal: true

module Seed
  module Types
    class V2TestCaseFunctionOne < Internal::Types::Model
      field :type, -> { Seed::Types::V2TestCaseFunctionOneType }, optional: false, nullable: false
    end
  end
end
