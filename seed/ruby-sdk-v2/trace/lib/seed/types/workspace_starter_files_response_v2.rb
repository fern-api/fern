# frozen_string_literal: true

module Seed
  module Types
    class WorkspaceStarterFilesResponseV2 < Internal::Types::Model
      field :files_by_language, -> { Internal::Types::Hash[String, Seed::Types::V2Files] }, optional: false, nullable: false, api_name: "filesByLanguage"
    end
  end
end
