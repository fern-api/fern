# frozen_string_literal: true

module Problem
    module Types
        class UpdateProblemResponse < Internal::Types::Model
            field :problem_version, Integer, optional: true, nullable: true
        end
    end
end
