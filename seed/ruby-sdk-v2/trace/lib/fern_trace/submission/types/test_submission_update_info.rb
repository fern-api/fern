# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TestSubmissionUpdateInfo < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { FernTrace::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { Object }, key: "STOPPED"
        member -> { FernTrace::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { FernTrace::Submission::Types::GradedTestCaseUpdate }, key: "GRADED_TEST_CASE"
        member -> { FernTrace::Submission::Types::RecordedTestCaseUpdate }, key: "RECORDED_TEST_CASE"
        member -> { Object }, key: "FINISHED"
      end
    end
  end
end
