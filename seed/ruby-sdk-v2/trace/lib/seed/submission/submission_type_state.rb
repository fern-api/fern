# frozen_string_literal: true

module Seed
    module Types
        class SubmissionTypeState < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::TestSubmissionState }, key: "TEST"
            member -> { Seed::Submission::WorkspaceSubmissionState }, key: "WORKSPACE"
    end
end
