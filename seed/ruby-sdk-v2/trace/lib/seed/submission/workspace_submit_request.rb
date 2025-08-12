
module Seed
    module Types
        class WorkspaceSubmitRequest < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :language, , optional: false, nullable: false
            field :submission_files, , optional: false, nullable: false
            field :user_id, , optional: true, nullable: false
        end
    end
end
