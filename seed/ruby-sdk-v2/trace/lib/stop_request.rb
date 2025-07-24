# frozen_string_literal: true

module Submission
    module Types
        class StopRequest < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
        end
    end
end
