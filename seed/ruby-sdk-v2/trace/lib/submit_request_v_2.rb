# frozen_string_literal: true

module Submission
    module Types
        class SubmitRequestV2 < Internal::Types::Model
            field :submission_id, SubmissionId, optional: true, nullable: true
            field :language, Language, optional: true, nullable: true
            field :submission_files, Array, optional: true, nullable: true
            field :problem_id, ProblemId, optional: true, nullable: true
            field :problem_version, Array, optional: true, nullable: true
            field :user_id, Array, optional: true, nullable: true
        end
    end
end
