# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class TestSubmissionState < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :default_test_cases, -> { Internal::Types::Array[FernTrace::Commons::Types::TestCase] }, optional: false, nullable: false, api_name: "defaultTestCases"
        field :custom_test_cases, -> { Internal::Types::Array[FernTrace::Commons::Types::TestCase] }, optional: false, nullable: false, api_name: "customTestCases"
        field :status, -> { FernTrace::Submission::Types::TestSubmissionStatus }, optional: false, nullable: false
      end
    end
  end
end
