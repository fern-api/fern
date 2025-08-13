# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceStarterFilesResponseV2 < Internal::Types::Model
            field :files_by_language, Internal::Types::Hash[Seed::Commons::Language, Seed::V2::Problem::Files], optional: false, nullable: false

    end
end
