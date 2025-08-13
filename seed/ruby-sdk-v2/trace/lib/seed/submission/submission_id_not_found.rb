
module Seed
    module Types
        class SubmissionIdNotFound < Internal::Types::Model
            field :missing_submission_id, String, optional: false, nullable: false
        end
    end
end
