# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class ProblemDescriptionBoard < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { String }, key: "HTML"
        member -> { FernTrace::Commons::Types::VariableValue }, key: "VARIABLE"
        member -> { String }, key: "TEST_CASE_ID"
      end
    end
  end
end
