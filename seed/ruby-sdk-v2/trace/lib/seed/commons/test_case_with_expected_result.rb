
module Seed
    module Types
        class TestCaseWithExpectedResult < Internal::Types::Model
            field :test_case, Seed::commons::TestCase, optional: false, nullable: false
            field :expected_result, Seed::commons::VariableValue, optional: false, nullable: false

    end
end
