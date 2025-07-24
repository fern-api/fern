# frozen_string_literal: true

module Submission
    module Types
        class TestSubmissionStatusV2 < Internal::Types::Model
            field :updates, Array, optional: true, nullable: true
            field :problem_id, ProblemId, optional: true, nullable: true
            field :problem_version, Integer, optional: true, nullable: true
            field :problem_info, ProblemInfoV2, optional: true, nullable: true
        end
    end
end
