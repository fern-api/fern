# frozen_string_literal: true

module Problem
    module Types
        class CreateProblemRequest < Internal::Types::Model
            field :problem_name, String, optional: true, nullable: true
            field :problem_description, ProblemDescription, optional: true, nullable: true
            field :files, Array, optional: true, nullable: true
            field :input_params, Array, optional: true, nullable: true
            field :output_type, VariableType, optional: true, nullable: true
            field :testcases, Array, optional: true, nullable: true
            field :method_name, String, optional: true, nullable: true
        end
    end
end
