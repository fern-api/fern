
module Seed
    module Types
        class InitializeProblemRequest < Internal::Types::Model
            field :problem_id, , optional: false, nullable: false
            field :problem_version, , optional: true, nullable: false
        end
    end
end
