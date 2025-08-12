
module Seed
    module Types
        class WorkspaceFiles < Internal::Types::Model
            field :main_file, , optional: false, nullable: false
            field :read_only_files, , optional: false, nullable: false
        end
    end
end
