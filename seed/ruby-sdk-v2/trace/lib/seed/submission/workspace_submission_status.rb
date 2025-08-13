# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceSubmissionStatus < Internal::Types::Union

            discriminant :type

            member -> { Object }, key: "STOPPED"
            member -> { Seed::Submission::ErrorInfo }, key: "ERRORED"
            member -> { Seed::Submission::RunningSubmissionState }, key: "RUNNING"
            member -> { Seed::Submission::WorkspaceRunDetails }, key: "RAN"
            member -> { Seed::Submission::WorkspaceRunDetails }, key: "TRACED"
    end
end
