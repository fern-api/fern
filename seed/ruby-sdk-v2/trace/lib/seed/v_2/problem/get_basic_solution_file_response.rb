
module Seed
    module Types
        class GetBasicSolutionFileResponse < Internal::Types::Model
            field :solution_file_by_language, Internal::Types::Hash[Seed::commons::Language, Seed::v_2::problem::FileInfoV2], optional: false, nullable: false
        end
    end
end
