# frozen_string_literal: true

module Submission
    module Types
        class StdoutResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :stdout, String, optional: true, nullable: true
        end
    end
end
