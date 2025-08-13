# frozen_string_literal: true

module Seed
    module Types
        class TestSubmissionStatusV2 < Internal::Types::Model
            field :updates, Internal::Types::Array[Seed::Submission::TestSubmissionUpdate], optional: false, nullable: false
            field :problem_id, String, optional: false, nullable: false
            field :problem_version, Integer, optional: false, nullable: false
            field :problem_info, Seed::V2::Problem::ProblemInfoV2, optional: false, nullable: false

    end
end
