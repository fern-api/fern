# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceSubmissionStatus < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "STOPPED"
        member -> { Seed::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { Seed::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { Seed::Submission::Types::WorkspaceRunDetails }, key: "RAN"
        member -> { Seed::Submission::Types::WorkspaceRunDetails }, key: "TRACED"
      end
    end
  end
end
