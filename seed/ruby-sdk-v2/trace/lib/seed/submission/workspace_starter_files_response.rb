# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceStarterFilesResponse < Internal::Types::Model
            field :files, Internal::Types::Hash[Seed::Commons::Language, Seed::Submission::WorkspaceFiles], optional: false, nullable: false

    end
end
