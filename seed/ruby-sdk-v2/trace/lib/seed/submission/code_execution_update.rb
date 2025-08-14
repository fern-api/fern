# frozen_string_literal: true

module Seed
    module Types
        class CodeExecutionUpdate < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::BuildingExecutorResponse }, key: "BUILDING_EXECUTOR"
            member -> { Seed::Submission::RunningResponse }, key: "RUNNING"
            member -> { Seed::Submission::ErroredResponse }, key: "ERRORED"
            member -> { Seed::Submission::StoppedResponse }, key: "STOPPED"
            member -> { Seed::Submission::GradedResponse }, key: "GRADED"
            member -> { Seed::Submission::GradedResponseV2 }, key: "GRADED_V_2"
            member -> { Seed::Submission::WorkspaceRanResponse }, key: "WORKSPACE_RAN"
            member -> { Seed::Submission::RecordingResponseNotification }, key: "RECORDING"
            member -> { Seed::Submission::RecordedResponseNotification }, key: "RECORDED"
            member -> { Seed::Submission::InvalidRequestResponse }, key: "INVALID_REQUEST"
            member -> { Seed::Submission::FinishedResponse }, key: "FINISHED"
    end
end
