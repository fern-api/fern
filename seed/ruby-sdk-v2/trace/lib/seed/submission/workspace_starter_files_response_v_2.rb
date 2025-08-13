
module Seed
    module Types
        class WorkspaceStarterFilesResponseV2 < Internal::Types::Model
            field :files_by_language, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::problem::Files], optional: false, nullable: false

    end
end
