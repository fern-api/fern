# frozen_string_literal: true

module Seed
    module Types
        class SubmissionStatusV2 < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::TestSubmissionStatusV2 }, key: "TEST"
            member -> { Seed::Submission::WorkspaceSubmissionStatusV2 }, key: "WORKSPACE"
    end
end
