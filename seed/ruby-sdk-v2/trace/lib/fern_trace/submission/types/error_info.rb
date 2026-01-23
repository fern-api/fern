# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class ErrorInfo < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::CompileError }, key: "COMPILE_ERROR"
        member -> { FernTrace::Submission::Types::RuntimeError }, key: "RUNTIME_ERROR"
        member -> { FernTrace::Submission::Types::InternalError }, key: "INTERNAL_ERROR"
      end
    end
  end
end
