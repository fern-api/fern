
module Seed
    module Types
        class GetSubmissionStateResponse < Internal::Types::Model
            field :time_submitted, , optional: true, nullable: false
            field :submission, , optional: false, nullable: false
            field :language, , optional: false, nullable: false
            field :submission_type_state, , optional: false, nullable: false
        end
    end
end
