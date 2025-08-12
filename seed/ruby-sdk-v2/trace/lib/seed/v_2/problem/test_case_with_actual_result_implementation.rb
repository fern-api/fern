
module Seed
    module Types
        class TestCaseWithActualResultImplementation < Internal::Types::Model
            field :get_actual_result, , optional: false, nullable: false
            field :assert_correctness_check, , optional: false, nullable: false
        end
    end
end
