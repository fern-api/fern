# frozen_string_literal: true

module Submission
    module Types
        class TestCaseResult < Internal::Types::Model
            field :expected_result, VariableValue, optional: true, nullable: true
            field :actual_result, ActualResult, optional: true, nullable: true
            field :passed, Boolean, optional: true, nullable: true
        end
    end
end
