# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceSubmissionUpdateInfo < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { Seed::Submission::Types::WorkspaceRunDetails }, key: "RAN"
        member -> { Object }, key: "STOPPED"
        member -> { Object }, key: "TRACED"
        member -> { Seed::Submission::Types::WorkspaceTracedUpdate }, key: "TRACED_V_2"
        member -> { Seed::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { Object }, key: "FINISHED"
      end
    end
  end
end
