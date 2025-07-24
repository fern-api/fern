# frozen_string_literal: true

module Submission
    module Types
        class StderrResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :stderr, String, optional: true, nullable: true
        end
    end
end
