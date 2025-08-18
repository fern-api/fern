# frozen_string_literal: true

module Seed
    module Types
        class CreateProblemRequest < Internal::Types::Model
            field :problem_name, String, optional: false, nullable: false
            field :problem_description, Seed::Problem::ProblemDescription, optional: false, nullable: false
            field :files, Internal::Types::Hash[Seed::Commons::Language, Seed::Problem::ProblemFiles], optional: false, nullable: false
            field :input_params, Internal::Types::Array[Seed::Problem::VariableTypeAndName], optional: false, nullable: false
            field :output_type, Seed::Commons::VariableType, optional: false, nullable: false
            field :testcases, Internal::Types::Array[Seed::Commons::TestCaseWithExpectedResult], optional: false, nullable: false
            field :method_name, String, optional: false, nullable: false

    end
end
