# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestSubmissionUpdateInfo < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { Object }, key: "STOPPED"
        member -> { Seed::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { Seed::Submission::Types::GradedTestCaseUpdate }, key: "GRADED_TEST_CASE"
        member -> { Seed::Submission::Types::RecordedTestCaseUpdate }, key: "RECORDED_TEST_CASE"
        member -> { Object }, key: "FINISHED"
      end
    end
  end
end
