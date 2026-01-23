# frozen_string_literal: true

module FernTrace
  module Admin
    module Types
      class StoreTracedTestCaseRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :test_case_id, -> { String }, optional: false, nullable: false, api_name: "testCaseId"
        field :result, -> { FernTrace::Submission::Types::TestCaseResultWithStdout }, optional: false, nullable: false
        field :trace_responses, -> { Internal::Types::Array[FernTrace::Submission::Types::TraceResponse] }, optional: false, nullable: false, api_name: "traceResponses"
      end
    end
  end
end
