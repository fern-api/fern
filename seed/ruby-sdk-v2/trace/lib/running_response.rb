# frozen_string_literal: true

module Submission
    module Types
        class RunningResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :state, RunningSubmissionState, optional: true, nullable: true
        end
    end
end
