# frozen_string_literal: true

module Seed
    module Types
        class SubmissionResponse < Internal::Types::Union

            discriminant :type

            member -> { Object }, key: "SERVER_INITIALIZED"
            member -> { String }, key: "PROBLEM_INITIALIZED"
            member -> { Object }, key: "WORKSPACE_INITIALIZED"
            member -> { Seed::Submission::ExceptionInfo }, key: "SERVER_ERRORED"
            member -> { Seed::Submission::CodeExecutionUpdate }, key: "CODE_EXECUTION_UPDATE"
            member -> { Seed::Submission::TerminatedResponse }, key: "TERMINATED"
    end
end
