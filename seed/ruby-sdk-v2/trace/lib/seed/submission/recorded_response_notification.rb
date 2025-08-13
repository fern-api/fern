
module Seed
    module Types
        class RecordedResponseNotification < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :trace_responses_size, Integer, optional: false, nullable: false
            field :test_case_id, String, optional: true, nullable: false

    end
end
