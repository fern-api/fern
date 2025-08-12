
module Seed
    module Types
        class RecordedResponseNotification < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :trace_responses_size, , optional: false, nullable: false
            field :test_case_id, , optional: true, nullable: false
        end
    end
end
