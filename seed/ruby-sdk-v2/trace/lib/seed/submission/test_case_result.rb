
module Seed
    module Types
        class TestCaseResult < Internal::Types::Model
            field :expected_result, Seed::commons::VariableValue, optional: false, nullable: false
            field :actual_result, Seed::submission::ActualResult, optional: false, nullable: false
            field :passed, Internal::Types::Boolean, optional: false, nullable: false

    end
end
