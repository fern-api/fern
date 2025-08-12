
module Seed
    module Types
        class TestCaseResult < Internal::Types::Model
            field :expected_result, , optional: false, nullable: false
            field :actual_result, , optional: false, nullable: false
            field :passed, , optional: false, nullable: false
        end
    end
end
