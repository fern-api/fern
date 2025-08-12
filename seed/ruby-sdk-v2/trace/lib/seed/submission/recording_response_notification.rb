
module Seed
    module Types
        class RecordingResponseNotification < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :test_case_id, , optional: true, nullable: false
            field :line_number, , optional: false, nullable: false
            field :lightweight_stack_info, , optional: false, nullable: false
            field :traced_file, , optional: true, nullable: false
        end
    end
end
