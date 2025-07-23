# frozen_string_literal: true

module Problem
    module Types
        class ProblemFiles < Internal::Types::Model
            field :solution_file, FileInfo, optional: true, nullable: true
            field :read_only_files, Array, optional: true, nullable: true
        end
    end
end
