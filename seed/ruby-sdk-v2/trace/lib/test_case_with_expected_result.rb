# frozen_string_literal: true

module Commons
    module Types
        class TestCaseWithExpectedResult < Internal::Types::Model
            field :test_case, TestCase, optional: true, nullable: true
            field :expected_result, VariableValue, optional: true, nullable: true
        end
    end
end
