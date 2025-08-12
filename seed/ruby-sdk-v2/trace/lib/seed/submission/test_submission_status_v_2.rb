
module Seed
    module Types
        class TestSubmissionStatusV2 < Internal::Types::Model
            field :updates, , optional: false, nullable: false
            field :problem_id, , optional: false, nullable: false
            field :problem_version, , optional: false, nullable: false
            field :problem_info, , optional: false, nullable: false
        end
    end
end
