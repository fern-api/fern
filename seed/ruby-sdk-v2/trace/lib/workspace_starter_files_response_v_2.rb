# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceStarterFilesResponseV2 < Internal::Types::Model
            field :files_by_language, Array, optional: true, nullable: true
        end
    end
end
