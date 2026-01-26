# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceSubmissionUpdateInfo < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { FernTrace::Submission::Types::WorkspaceRunDetails }, key: "RAN"
        member -> { Object }, key: "STOPPED"
        member -> { Object }, key: "TRACED"
        member -> { FernTrace::Submission::Types::WorkspaceTracedUpdate }, key: "TRACED_V_2"
        member -> { FernTrace::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { Object }, key: "FINISHED"
      end
    end
  end
end
