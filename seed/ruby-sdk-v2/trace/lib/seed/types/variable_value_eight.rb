# frozen_string_literal: true

module Seed
  module Types
    class VariableValueEight < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueEightType }, optional: false, nullable: false
    end
  end
end
