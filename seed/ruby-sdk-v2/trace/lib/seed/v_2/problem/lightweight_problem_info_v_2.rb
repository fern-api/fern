
module Seed
    module Types
        class LightweightProblemInfoV2 < Internal::Types::Model
            field :problem_id, , optional: false, nullable: false
            field :problem_name, , optional: false, nullable: false
            field :problem_version, , optional: false, nullable: false
            field :variable_types, , optional: false, nullable: false
        end
    end
end
