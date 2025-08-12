
module Seed
    module Types
        class GradedResponseV2 < Internal::Types::Model
            field :submission_id, , optional: false, nullable: false
            field :test_cases, , optional: false, nullable: false
        end
    end
end
