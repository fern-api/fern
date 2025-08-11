# frozen_string_literal: true

module V2
    module Types
        class GetBasicSolutionFileResponse < Internal::Types::Model
            field :solution_file_by_language, Array, optional: true, nullable: true
        end
    end
end
