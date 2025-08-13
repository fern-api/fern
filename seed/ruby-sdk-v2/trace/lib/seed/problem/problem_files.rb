
module Seed
    module Types
        class ProblemFiles < Internal::Types::Model
            field :solution_file, Seed::commons::FileInfo, optional: false, nullable: false
            field :read_only_files, Internal::Types::Array[Seed::commons::FileInfo], optional: false, nullable: false
        end
    end
end
