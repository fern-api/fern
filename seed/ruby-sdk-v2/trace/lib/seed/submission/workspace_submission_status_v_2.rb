# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceSubmissionStatusV2 < Internal::Types::Model
            field :updates, Internal::Types::Array[Seed::Submission::WorkspaceSubmissionUpdate], optional: false, nullable: false

    end
end
