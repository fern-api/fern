# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceSubmissionUpdateInfo < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::RunningSubmissionState }, key: "RUNNING"
            member -> { Seed::Submission::WorkspaceRunDetails }, key: "RAN"
            member -> { Object }, key: "STOPPED"
            member -> { Object }, key: "TRACED"
            member -> { Seed::Submission::WorkspaceTracedUpdate }, key: "TRACED_V_2"
            member -> { Seed::Submission::ErrorInfo }, key: "ERRORED"
            member -> { Object }, key: "FINISHED"
    end
end
