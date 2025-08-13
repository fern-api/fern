
module Seed
    module Types
        class ProblemDescription < Internal::Types::Model
            field :boards, Internal::Types::Array[Seed::problem::ProblemDescriptionBoard], optional: false, nullable: false
        end
    end
end
