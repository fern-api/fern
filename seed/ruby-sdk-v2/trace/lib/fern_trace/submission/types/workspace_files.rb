# frozen_string_literal: true

module FernTrace
  module Submission
    module Types
      class WorkspaceFiles < Internal::Types::Model
        field :main_file, -> { FernTrace::Commons::Types::FileInfo }, optional: false, nullable: false, api_name: "mainFile"
        field :read_only_files, -> { Internal::Types::Array[FernTrace::Commons::Types::FileInfo] }, optional: false, nullable: false, api_name: "readOnlyFiles"
      end
    end
  end
end
