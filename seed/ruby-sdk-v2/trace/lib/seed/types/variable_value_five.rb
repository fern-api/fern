# frozen_string_literal: true

module Seed
  module Types
    class VariableValueFive < Internal::Types::Model
      field :type, -> { Seed::Types::VariableValueFiveType }, optional: false, nullable: false
    end
  end
end
