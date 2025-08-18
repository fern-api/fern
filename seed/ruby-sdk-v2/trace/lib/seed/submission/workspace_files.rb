# frozen_string_literal: true

module Seed
    module Types
        class WorkspaceFiles < Internal::Types::Model
            field :main_file, Seed::Commons::FileInfo, optional: false, nullable: false
            field :read_only_files, Internal::Types::Array[Seed::Commons::FileInfo], optional: false, nullable: false

    end
end
