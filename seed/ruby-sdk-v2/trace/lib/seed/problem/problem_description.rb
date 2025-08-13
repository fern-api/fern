# frozen_string_literal: true

module Seed
    module Types
        class ProblemDescription < Internal::Types::Model
            field :boards, Internal::Types::Array[Seed::Problem::ProblemDescriptionBoard], optional: false, nullable: false

    end
end
