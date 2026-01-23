# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TestSubmissionStatus < Internal::Types::Model
        extend FernTrace::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "STOPPED"
        member -> { FernTrace::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { FernTrace::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member -> { Internal::Types::Hash[String, FernTrace::Submission::Types::SubmissionStatusForTestCase] }, key: "TEST_CASE_ID_TO_STATE"
      end
    end
  end
end
