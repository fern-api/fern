# frozen_string_literal: true

module Seed
    module Types
        class ErrorInfo < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::CompileError }, key: "COMPILE_ERROR"
            member -> { Seed::Submission::RuntimeError }, key: "RUNTIME_ERROR"
            member -> { Seed::Submission::InternalError }, key: "INTERNAL_ERROR"
    end
end
