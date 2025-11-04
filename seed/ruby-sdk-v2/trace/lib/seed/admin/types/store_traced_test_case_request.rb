# frozen_string_literal: true

module Seed
  module Admin
    module Types
      class StoreTracedTestCaseRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :test_case_id, -> { String }, optional: false, nullable: false, api_name: "testCaseId"
        field :result, -> { Seed::Submission::Types::TestCaseResultWithStdout }, optional: false, nullable: false
        field :trace_responses, lambda {
          Internal::Types::Array[Seed::Submission::Types::TraceResponse]
        }, optional: false, nullable: false, api_name: "traceResponses"
      end
    end
  end
end
