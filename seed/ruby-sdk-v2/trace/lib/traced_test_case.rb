# frozen_string_literal: true

module Submission
    module Types
        class TracedTestCase < Internal::Types::Model
            field :result, TestCaseResultWithStdout, optional: true, nullable: true
            field :trace_responses_size, Integer, optional: true, nullable: true
        end
    end
end
