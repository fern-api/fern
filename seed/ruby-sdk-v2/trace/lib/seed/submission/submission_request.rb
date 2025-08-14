# frozen_string_literal: true

module Seed
    module Types
        class SubmissionRequest < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::InitializeProblemRequest }, key: "INITIALIZE_PROBLEM_REQUEST"
            member -> { Object }, key: "INITIALIZE_WORKSPACE_REQUEST"
            member -> { Seed::Submission::SubmitRequestV2 }, key: "SUBMIT_V_2"
            member -> { Seed::Submission::WorkspaceSubmitRequest }, key: "WORKSPACE_SUBMIT"
            member -> { Seed::Submission::StopRequest }, key: "STOP"
    end
end
