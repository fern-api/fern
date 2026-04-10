# frozen_string_literal: true

module Seed
  module Types
    class TestSubmissionStatus < Internal::Types::Model
      extend Seed::Internal::Types::Union

      discriminant :type

      member -> { Seed::Types::TestSubmissionStatusStopped }, key: "STOPPED"
      member -> { Seed::Types::TestSubmissionStatusErrored }, key: "ERRORED"
      member -> { Seed::Types::TestSubmissionStatusRunning }, key: "RUNNING"
      member -> { Seed::Types::TestSubmissionStatusTestCaseIDToState }, key: "TEST_CASE_ID_TO_STATE"
    end
  end
end
