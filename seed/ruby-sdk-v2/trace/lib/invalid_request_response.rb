# frozen_string_literal: true

module Submission
    module Types
        class InvalidRequestResponse < Internal::Types::Model
            field :request, SubmissionRequest, optional: true, nullable: true
            field :cause, InvalidRequestCause, optional: true, nullable: true
        end
    end
end
