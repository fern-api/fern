# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestSubmissionStatus < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Object }, key: "STOPPED"
        member -> { Seed::Submission::Types::ErrorInfo }, key: "ERRORED"
        member -> { Seed::Submission::Types::RunningSubmissionState }, key: "RUNNING"
        member lambda {
          Internal::Types::Hash[String, Seed::Submission::Types::SubmissionStatusForTestCase]
        }, key: "TEST_CASE_ID_TO_STATE"
      end
    end
  end
end
