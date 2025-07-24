# frozen_string_literal: true

module Submission
    module Types
        class RecordedTestCaseUpdate < Internal::Types::Model
            field :test_case_id, TestCaseId, optional: true, nullable: true
            field :trace_responses_size, Integer, optional: true, nullable: true
        end
    end
end
