# frozen_string_literal: true

module Seed
    module Types
        class TestSubmissionStatus < Internal::Types::Union

            discriminant :type

            member -> { Object }, key: "STOPPED"
            member -> { Seed::Submission::ErrorInfo }, key: "ERRORED"
            member -> { Seed::Submission::RunningSubmissionState }, key: "RUNNING"
            member -> { Internal::Types::Hash[String, Seed::Submission::SubmissionStatusForTestCase] }, key: "TEST_CASE_ID_TO_STATE"
    end
end
