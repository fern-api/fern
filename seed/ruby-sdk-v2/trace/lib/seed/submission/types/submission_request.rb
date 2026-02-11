# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class SubmissionRequest < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::InitializeProblemRequest }, key: "INITIALIZE_PROBLEM_REQUEST"
        member -> { Object }, key: "INITIALIZE_WORKSPACE_REQUEST"
        member -> { Seed::Submission::Types::SubmitRequestV2 }, key: "SUBMIT_V_2"
        member -> { Seed::Submission::Types::WorkspaceSubmitRequest }, key: "WORKSPACE_SUBMIT"
        member -> { Seed::Submission::Types::StopRequest }, key: "STOP"
      end
    end
  end
end
