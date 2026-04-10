# frozen_string_literal: true

module Seed
  module Types
    class V2V3TestCaseFunctionOne < Internal::Types::Model
      field :type, -> { Seed::Types::V2V3TestCaseFunctionOneType }, optional: false, nullable: false
    end
  end
end
