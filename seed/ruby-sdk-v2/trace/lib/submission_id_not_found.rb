# frozen_string_literal: true

module Submission
    module Types
        class SubmissionIdNotFound < Internal::Types::Model
            field :missing_submission_id, SubmissionId, optional: true, nullable: true
        end
    end
end
