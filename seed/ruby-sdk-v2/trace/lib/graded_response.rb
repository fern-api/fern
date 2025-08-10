# frozen_string_literal: true

module Submission
    module Types
        class GradedResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :test_cases, Array, optional: true, nullable: true
        end
    end
end
