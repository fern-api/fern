# frozen_string_literal: true

module Seed
    module Types
        class InvalidRequestResponse < Internal::Types::Model
            field :request, Seed::Submission::SubmissionRequest, optional: false, nullable: false
            field :cause, Seed::Submission::InvalidRequestCause, optional: false, nullable: false

    end
end
