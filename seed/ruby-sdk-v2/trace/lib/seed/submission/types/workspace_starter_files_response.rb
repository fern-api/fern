# frozen_string_literal: true

require_relative "../../../seed"

module Seed
  module Submission
    module Types
      class WorkspaceStarterFilesResponse < Internal::Types::Model
        field :files, -> { Internal::Types::Hash[Seed::Commons::Types::Language, Seed::Submission::Types::WorkspaceFiles] }, optional: false, nullable: false
      end
    end
  end
end
