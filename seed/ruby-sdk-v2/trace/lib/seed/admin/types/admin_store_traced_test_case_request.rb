# frozen_string_literal: true

module Seed
  module Admin
    module Types
      class AdminStoreTracedTestCaseRequest < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :test_case_id, -> { String }, optional: false, nullable: false, api_name: "testCaseId"
        field :result, -> { Seed::Types::TestCaseResultWithStdout }, optional: false, nullable: false
        field :trace_responses, -> { Internal::Types::Array[Seed::Types::TraceResponse] }, optional: false, nullable: false, api_name: "traceResponses"
      end
    end
  end
end
