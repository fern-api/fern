# frozen_string_literal: true

module Submission
    module Types
        class ExistingSubmissionExecuting < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
        end
    end
end
