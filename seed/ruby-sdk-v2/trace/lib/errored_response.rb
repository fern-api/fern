# frozen_string_literal: true

module Submission
    module Types
        class ErroredResponse < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :error_info, ErrorInfo, optional: true, nullable: true
        end
    end
end
