# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceStarterFilesResponseV2 < Internal::Types::Model
        field :files_by_language, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::Problem::Types::Files] }, optional: false, nullable: false, api_name: "filesByLanguage"
      end
    end
  end
end
