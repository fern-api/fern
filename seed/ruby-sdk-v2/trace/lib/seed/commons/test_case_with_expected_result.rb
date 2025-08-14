# frozen_string_literal: true

module Seed
    module Types
        class TestCaseWithExpectedResult < Internal::Types::Model
            field :test_case, Seed::Commons::TestCase, optional: false, nullable: false
            field :expected_result, Seed::Commons::VariableValue, optional: false, nullable: false

    end
end
