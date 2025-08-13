# frozen_string_literal: true

module Seed
    module Types
        class TestCaseFunction < Internal::Types::Union

            discriminant :type

            member -> { Seed::V2::Problem::TestCaseWithActualResultImplementation }, key: "WITH_ACTUAL_RESULT"
            member -> { Seed::V2::Problem::VoidFunctionDefinition }, key: "CUSTOM"
    end
end
