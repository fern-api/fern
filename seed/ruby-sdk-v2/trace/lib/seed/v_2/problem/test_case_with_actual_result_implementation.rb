# frozen_string_literal: true

module Seed
    module Types
        class TestCaseWithActualResultImplementation < Internal::Types::Model
            field :get_actual_result, Seed::V2::Problem::NonVoidFunctionDefinition, optional: false, nullable: false
            field :assert_correctness_check, Seed::V2::Problem::AssertCorrectnessCheck, optional: false, nullable: false

    end
end
