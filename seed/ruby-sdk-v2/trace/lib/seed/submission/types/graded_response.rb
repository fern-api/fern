# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class GradedResponse < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :test_cases, lambda {
          Internal::Types::Hash[String, Seed::Submission::Types::TestCaseResultWithStdout]
        }, optional: false, nullable: false, api_name: "testCases"
      end
    end
  end
end
