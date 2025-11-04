# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TestSubmissionState < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :default_test_cases, lambda {
          Internal::Types::Array[Seed::Commons::Types::TestCase]
        }, optional: false, nullable: false, api_name: "defaultTestCases"
        field :custom_test_cases, lambda {
          Internal::Types::Array[Seed::Commons::Types::TestCase]
        }, optional: false, nullable: false, api_name: "customTestCases"
        field :status, -> { Seed::Submission::Types::TestSubmissionStatus }, optional: false, nullable: false
      end
    end
  end
end
