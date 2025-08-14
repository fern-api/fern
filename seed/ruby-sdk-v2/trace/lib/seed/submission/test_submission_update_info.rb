# frozen_string_literal: true

module Seed
    module Types
        class TestSubmissionUpdateInfo < Internal::Types::Union

            discriminant :type

            member -> { Seed::Submission::RunningSubmissionState }, key: "RUNNING"
            member -> { Object }, key: "STOPPED"
            member -> { Seed::Submission::ErrorInfo }, key: "ERRORED"
            member -> { Seed::Submission::GradedTestCaseUpdate }, key: "GRADED_TEST_CASE"
            member -> { Seed::Submission::RecordedTestCaseUpdate }, key: "RECORDED_TEST_CASE"
            member -> { Object }, key: "FINISHED"
    end
end
