
module Seed
    module Types
        class TestSubmissionUpdate < Internal::Types::Model
            field :update_time, String, optional: false, nullable: false
            field :update_info, Seed::submission::TestSubmissionUpdateInfo, optional: false, nullable: false
        end
    end
end
