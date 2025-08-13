
module Seed
    module Types
        class WorkspaceFiles < Internal::Types::Model
            field :main_file, Seed::commons::FileInfo, optional: false, nullable: false
            field :read_only_files, Internal::Types::Array[Seed::commons::FileInfo], optional: false, nullable: false

    end
end
