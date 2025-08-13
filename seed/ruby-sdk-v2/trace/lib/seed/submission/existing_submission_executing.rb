
module Seed
    module Types
        class ExistingSubmissionExecuting < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
        end
    end
end
