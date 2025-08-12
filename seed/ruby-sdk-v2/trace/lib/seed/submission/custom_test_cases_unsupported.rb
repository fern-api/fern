
module Seed
    module Types
        class CustomTestCasesUnsupported < Internal::Types::Model
            field :problem_id, , optional: false, nullable: false
            field :submission_id, , optional: false, nullable: false
        end
    end
end
