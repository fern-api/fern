
module Seed
    module Types
        class SubmitRequestV2 < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :language, Seed::commons::Language, optional: false, nullable: false
            field :submission_files, Internal::Types::Array[Seed::submission::SubmissionFileInfo], optional: false, nullable: false
            field :problem_id, String, optional: false, nullable: false
            field :problem_version, Integer, optional: true, nullable: false
            field :user_id, String, optional: true, nullable: false
        end
    end
end
