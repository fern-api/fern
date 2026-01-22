# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class CodeExecutionUpdate < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::BuildingExecutorResponse }, key: "BUILDING_EXECUTOR"
        member -> { FernTrace::Submission::Types::RunningResponse }, key: "RUNNING"
        member -> { FernTrace::Submission::Types::ErroredResponse }, key: "ERRORED"
        member -> { FernTrace::Submission::Types::StoppedResponse }, key: "STOPPED"
        member -> { FernTrace::Submission::Types::GradedResponse }, key: "GRADED"
        member -> { FernTrace::Submission::Types::GradedResponseV2 }, key: "GRADED_V_2"
        member -> { FernTrace::Submission::Types::WorkspaceRanResponse }, key: "WORKSPACE_RAN"
        member -> { FernTrace::Submission::Types::RecordingResponseNotification }, key: "RECORDING"
        member -> { FernTrace::Submission::Types::RecordedResponseNotification }, key: "RECORDED"
        member -> { FernTrace::Submission::Types::InvalidRequestResponse }, key: "INVALID_REQUEST"
        member -> { FernTrace::Submission::Types::FinishedResponse }, key: "FINISHED"
      end
    end
  end
end
