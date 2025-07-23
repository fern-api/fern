# frozen_string_literal: true

module Submission
    module Types
        class TestCaseResultWithStdout < Internal::Types::Model
            field :result, TestCaseResult, optional: true, nullable: true
            field :stdout, String, optional: true, nullable: true
        end
    end
end
