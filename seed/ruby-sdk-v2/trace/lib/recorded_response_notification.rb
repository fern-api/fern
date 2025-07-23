# frozen_string_literal: true

module Submission
    module Types
        class RecordedResponseNotification < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :trace_responses_size, Integer, optional: true, nullable: true
            field :test_case_id, Array, optional: true, nullable: true
        end
    end
end
