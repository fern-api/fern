# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemDescriptionBoard < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "HTML"
        member -> { Seed::Commons::Types::VariableValue }, key: "VARIABLE"
        member -> { String }, key: "TEST_CASE_ID"
      end
    end
  end
end
