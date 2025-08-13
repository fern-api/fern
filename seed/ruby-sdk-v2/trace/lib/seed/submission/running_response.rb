
module Seed
    module Types
        class RunningResponse < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :state, Seed::submission::RunningSubmissionState, optional: false, nullable: false
        end
    end
end
