
module Seed
    module Types
        class TestCaseWithExpectedResult < Internal::Types::Model
            field :test_case, , optional: false, nullable: false
            field :expected_result, , optional: false, nullable: false
        end
    end
end
