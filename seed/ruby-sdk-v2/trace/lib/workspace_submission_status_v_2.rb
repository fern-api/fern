# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceSubmissionStatusV2 < Internal::Types::Model
            field :updates, Array, optional: true, nullable: true
        end
    end
end
