
module Seed
    module Types
        class ProblemFiles < Internal::Types::Model
            field :solution_file, , optional: false, nullable: false
            field :read_only_files, , optional: false, nullable: false
        end
    end
end
