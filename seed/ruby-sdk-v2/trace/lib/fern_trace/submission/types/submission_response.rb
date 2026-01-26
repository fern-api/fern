# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class SubmissionResponse < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "SERVER_INITIALIZED"
        member -> { String }, key: "PROBLEM_INITIALIZED"
        member -> { Object }, key: "WORKSPACE_INITIALIZED"
        member -> { FernTrace::Submission::Types::ExceptionInfo }, key: "SERVER_ERRORED"
        member -> { FernTrace::Submission::Types::CodeExecutionUpdate }, key: "CODE_EXECUTION_UPDATE"
        member -> { FernTrace::Submission::Types::TerminatedResponse }, key: "TERMINATED"
      end
    end
  end
end
