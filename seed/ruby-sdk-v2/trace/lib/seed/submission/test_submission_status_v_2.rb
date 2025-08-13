
module Seed
    module Types
        class TestSubmissionStatusV2 < Internal::Types::Model
            field :updates, Internal::Types::Array[Seed::submission::TestSubmissionUpdate], optional: false, nullable: false
            field :problem_id, String, optional: false, nullable: false
            field :problem_version, Integer, optional: false, nullable: false
            field :problem_info, Seed::v_2::problem::ProblemInfoV2, optional: false, nullable: false
        end
    end
end
