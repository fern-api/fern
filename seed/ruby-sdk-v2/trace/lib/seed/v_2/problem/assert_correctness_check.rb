# frozen_string_literal: true

module Seed
    module Types
        class AssertCorrectnessCheck < Internal::Types::Union

            discriminant :type

            member -> { Seed::V2::Problem::DeepEqualityCorrectnessCheck }, key: "DEEP_EQUALITY"
            member -> { Seed::V2::Problem::VoidFunctionDefinitionThatTakesActualResult }, key: "CUSTOM"
    end
end
