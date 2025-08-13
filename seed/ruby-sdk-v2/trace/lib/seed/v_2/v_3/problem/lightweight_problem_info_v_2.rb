
module Seed
    module Types
        class LightweightProblemInfoV2 < Internal::Types::Model
            field :problem_id, String, optional: false, nullable: false
            field :problem_name, String, optional: false, nullable: false
            field :problem_version, Integer, optional: false, nullable: false
            field :variable_types, Internal::Types::Array[Seed::commons::VariableType], optional: false, nullable: false
        end
    end
end
