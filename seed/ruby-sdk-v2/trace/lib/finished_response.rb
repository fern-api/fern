# frozen_string_literal: true

module Submission
    module Types
        class FinishedResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
        end
    end
end
