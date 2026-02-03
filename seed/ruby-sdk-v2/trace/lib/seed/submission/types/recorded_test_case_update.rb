# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class RecordedTestCaseUpdate < Internal::Types::Model
        field :test_case_id, -> { String }, optional: false, nullable: false, api_name: "testCaseId"
        field :trace_responses_size, -> { Integer }, optional: false, nullable: false, api_name: "traceResponsesSize"
      end
    end
  end
end
