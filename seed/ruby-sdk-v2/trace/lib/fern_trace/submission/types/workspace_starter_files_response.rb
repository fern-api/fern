# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceStarterFilesResponse < Internal::Types::Model
        field :files, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::Submission::Types::WorkspaceFiles] }, optional: false, nullable: false
      end
    end
  end
end
