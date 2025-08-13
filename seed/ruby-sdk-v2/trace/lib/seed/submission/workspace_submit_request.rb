
module Seed
    module Types
        class WorkspaceSubmitRequest < Internal::Types::Model
            field :submission_id, String, optional: false, nullable: false
            field :language, Seed::commons::Language, optional: false, nullable: false
            field :submission_files, Internal::Types::Array[Seed::submission::SubmissionFileInfo], optional: false, nullable: false
            field :user_id, String, optional: true, nullable: false

    end
end
