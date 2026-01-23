# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class SubmissionRequest < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::InitializeProblemRequest }, key: "INITIALIZE_PROBLEM_REQUEST"
        member -> { Object }, key: "INITIALIZE_WORKSPACE_REQUEST"
        member -> { FernTrace::Submission::Types::SubmitRequestV2 }, key: "SUBMIT_V_2"
        member -> { FernTrace::Submission::Types::WorkspaceSubmitRequest }, key: "WORKSPACE_SUBMIT"
        member -> { FernTrace::Submission::Types::StopRequest }, key: "STOP"
      end
    end
  end
end
