# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class TracedTestCase < Internal::Types::Model
        field :result, -> { Seed::Submission::Types::TestCaseResultWithStdout }, optional: false, nullable: false
        field :trace_responses_size, -> { Integer }, optional: false, nullable: false, api_name: "traceResponsesSize"
      end
    end
  end
end
