# frozen_string_literal: true

module V2
    module Types
        class LightweightProblemInfoV2 < Internal::Types::Model
            field :problem_id, ProblemId, optional: true, nullable: true
            field :problem_name, String, optional: true, nullable: true
            field :problem_version, Integer, optional: true, nullable: true
            field :variable_types, Array, optional: true, nullable: true
        end
    end
end
