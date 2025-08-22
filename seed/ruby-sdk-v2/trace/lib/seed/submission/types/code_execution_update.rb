# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class CodeExecutionUpdate < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::BuildingExecutorResponse }, key: "BUILDING_EXECUTOR"
        member -> { Seed::Submission::Types::RunningResponse }, key: "RUNNING"
        member -> { Seed::Submission::Types::ErroredResponse }, key: "ERRORED"
        member -> { Seed::Submission::Types::StoppedResponse }, key: "STOPPED"
        member -> { Seed::Submission::Types::GradedResponse }, key: "GRADED"
        member -> { Seed::Submission::Types::GradedResponseV2 }, key: "GRADED_V_2"
        member -> { Seed::Submission::Types::WorkspaceRanResponse }, key: "WORKSPACE_RAN"
        member -> { Seed::Submission::Types::RecordingResponseNotification }, key: "RECORDING"
        member -> { Seed::Submission::Types::RecordedResponseNotification }, key: "RECORDED"
        member -> { Seed::Submission::Types::InvalidRequestResponse }, key: "INVALID_REQUEST"
        member -> { Seed::Submission::Types::FinishedResponse }, key: "FINISHED"
      end
    end
  end
end
