# frozen_string_literal: true

module Submission
    module Types
        class CustomTestCasesUnsupported < Internal::Types::Model
            field :problem_id, ProblemId, optional: true, nullable: true
            field :submission_id, SubmissionId, optional: true, nullable: true
        end
    end
end
