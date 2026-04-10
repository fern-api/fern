# frozen_string_literal: true

module Seed
  module Types
    class ProblemDescriptionBoardVariable < Internal::Types::Model
      field :value, -> { Seed::Types::VariableValue }, optional: true, nullable: false
    end
  end
end
