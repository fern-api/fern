# frozen_string_literal: true

module Seed
    module Types
        class FunctionSignature < Internal::Types::Union

            discriminant :type

            member -> { Seed::V2::Problem::VoidFunctionSignature }, key: "VOID"
            member -> { Seed::V2::Problem::NonVoidFunctionSignature }, key: "NON_VOID"
            member -> { Seed::V2::Problem::VoidFunctionSignatureThatTakesActualResult }, key: "VOID_THAT_TAKES_ACTUAL_RESULT"
    end
end
