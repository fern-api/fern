# frozen_string_literal: true

module V2
    module Types
        class TestCaseWithActualResultImplementation < Internal::Types::Model
            field :get_actual_result, NonVoidFunctionDefinition, optional: true, nullable: true
            field :assert_correctness_check, AssertCorrectnessCheck, optional: true, nullable: true
        end
    end
end
