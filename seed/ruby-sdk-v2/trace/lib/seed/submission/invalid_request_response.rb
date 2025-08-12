
module Seed
    module Types
        class InvalidRequestResponse < Internal::Types::Model
            field :request, Seed::submission::SubmissionRequest, optional: false, nullable: false
            field :cause, Seed::submission::InvalidRequestCause, optional: false, nullable: false
        end
    end
end
