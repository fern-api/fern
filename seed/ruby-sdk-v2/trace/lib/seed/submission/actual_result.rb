# frozen_string_literal: true

module Seed
    module Types
        class ActualResult < Internal::Types::Union

            discriminant :type

            member -> { Seed::Commons::VariableValue }, key: "VALUE"
            member -> { Seed::Submission::ExceptionInfo }, key: "EXCEPTION"
            member -> { Seed::Submission::ExceptionV2 }, key: "EXCEPTION_V_2"
    end
end
