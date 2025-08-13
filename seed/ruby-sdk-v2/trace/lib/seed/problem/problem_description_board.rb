# frozen_string_literal: true

module Seed
    module Types
        class ProblemDescriptionBoard < Internal::Types::Union

            discriminant :type

            member -> { String }, key: "HTML"
            member -> { Seed::Commons::VariableValue }, key: "VARIABLE"
            member -> { String }, key: "TEST_CASE_ID"
    end
end
