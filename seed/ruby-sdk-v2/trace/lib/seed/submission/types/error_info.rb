# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class ErrorInfo < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::CompileError }, key: "COMPILE_ERROR"
        member -> { Seed::Submission::Types::RuntimeError }, key: "RUNTIME_ERROR"
        member -> { Seed::Submission::Types::InternalError }, key: "INTERNAL_ERROR"
      end
    end
  end
end
