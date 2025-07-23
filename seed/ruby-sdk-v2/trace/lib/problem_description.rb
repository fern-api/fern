# frozen_string_literal: true

module Problem
    module Types
        class ProblemDescription < Internal::Types::Model
            field :boards, Array, optional: true, nullable: true
        end
    end
end
