# frozen_string_literal: true

module Seed
  module Submission
    module Types
      class WorkspaceFiles < Internal::Types::Model
        field :main_file, -> { Seed::Commons::Types::FileInfo }, optional: false, nullable: false, api_name: "mainFile"
        field :read_only_files, lambda {
          Internal::Types::Array[Seed::Commons::Types::FileInfo]
        }, optional: false, nullable: false, api_name: "readOnlyFiles"
      end
    end
  end
end
