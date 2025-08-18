# frozen_string_literal: true

module Seed
    module Types
        class TestCaseResult < Internal::Types::Model
            field :expected_result, Seed::Commons::VariableValue, optional: false, nullable: false
            field :actual_result, Seed::Submission::ActualResult, optional: false, nullable: false
            field :passed, Internal::Types::Boolean, optional: false, nullable: false

    end
end
