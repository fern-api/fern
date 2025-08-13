
module Seed
    module Types
        class TestCaseWithActualResultImplementation < Internal::Types::Model
            field :get_actual_result, Seed::v_2::v_3::problem::NonVoidFunctionDefinition, optional: false, nullable: false
            field :assert_correctness_check, Seed::v_2::v_3::problem::AssertCorrectnessCheck, optional: false, nullable: false

    end
end
