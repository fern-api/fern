# frozen_string_literal: true

module Submission
    module Types
        class TestSubmissionState < Internal::Types::Model
            field :problem_id, ProblemId, optional: true, nullable: true
            field :default_test_cases, Array, optional: true, nullable: true
            field :custom_test_cases, Array, optional: true, nullable: true
            field :status, TestSubmissionStatus, optional: true, nullable: true
        end
    end
end
