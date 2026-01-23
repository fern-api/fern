# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class GradedResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :test_cases, -> { Internal::Types::Hash[String, FernTrace::Submission::Types::TestCaseResultWithStdout] }, optional: false, nullable: false, api_name: "testCases"
      end
    end
  end
end
