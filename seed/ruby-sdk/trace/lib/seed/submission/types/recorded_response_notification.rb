# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class RecordedResponseNotification < Internal::Types::Model
        field :submission_id, -> { String }, optional: false, nullable: false, api_name: "submissionId"
        field :trace_responses_size, -> { Integer }, optional: false, nullable: false, api_name: "traceResponsesSize"
        field :test_case_id, -> { String }, optional: true, nullable: false, api_name: "testCaseId"
      end
    end
  end
end
