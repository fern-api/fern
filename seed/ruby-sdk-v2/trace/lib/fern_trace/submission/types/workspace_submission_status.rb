# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceSubmissionStatus < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "STOPPED"
        member -> { FernTrace::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { FernTrace::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { FernTrace::Submission::Types::WorkspaceRunDetails }, key: "RAN"
        member -> { FernTrace::Submission::Types::WorkspaceRunDetails }, key: "TRACED"
      end
    end
  end
end
