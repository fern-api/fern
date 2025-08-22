# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionResponse < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "SERVER_INITIALIZED"
        member -> { String }, key: "PROBLEM_INITIALIZED"
        member -> { Object }, key: "WORKSPACE_INITIALIZED"
        member -> { Seed::Submission::Types::ExceptionInfo }, key: "SERVER_ERRORED"
        member -> { Seed::Submission::Types::CodeExecutionUpdate }, key: "CODE_EXECUTION_UPDATE"
        member -> { Seed::Submission::Types::TerminatedResponse }, key: "TERMINATED"
      end
    end
  end
end
