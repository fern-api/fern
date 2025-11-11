# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceStarterFilesResponseV2 < Internal::Types::Model
        field :files_by_language, lambda {
          Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::Problem::Types::Files]
        }, optional: false, nullable: false, api_name: "filesByLanguage"
      end
    end
  end
end
