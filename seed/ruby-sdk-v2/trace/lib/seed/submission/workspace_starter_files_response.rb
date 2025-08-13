
module Seed
    module Types
        class WorkspaceStarterFilesResponse < Internal::Types::Model
            field :files, Internal::Types::Hash[Seed::commons::Language, Seed::submission::WorkspaceFiles], optional: false, nullable: false

    end
end
