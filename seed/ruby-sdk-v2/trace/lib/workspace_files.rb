# frozen_string_literal: true

module Submission
    module Types
        class WorkspaceFiles < Internal::Types::Model
            field :main_file, FileInfo, optional: true, nullable: true
            field :read_only_files, Array, optional: true, nullable: true
        end
    end
end
