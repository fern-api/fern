
module Seed
    module Types
        class TestSubmissionUpdate < Internal::Types::Model
            field :update_time, , optional: false, nullable: false
            field :update_info, , optional: false, nullable: false
        end
    end
end
