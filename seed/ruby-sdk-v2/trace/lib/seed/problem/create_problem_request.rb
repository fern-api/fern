
module Seed
    module Types
        class CreateProblemRequest < Internal::Types::Model
            field :problem_name, String, optional: false, nullable: false
            field :problem_description, Seed::problem::ProblemDescription, optional: false, nullable: false
            field :files, Internal::Types::Hash[Seed::commons::Language, Seed::problem::ProblemFiles], optional: false, nullable: false
            field :input_params, Internal::Types::Array[Seed::problem::VariableTypeAndName], optional: false, nullable: false
            field :output_type, Seed::commons::VariableType, optional: false, nullable: false
            field :testcases, Internal::Types::Array[Seed::commons::TestCaseWithExpectedResult], optional: false, nullable: false
            field :method_name, String, optional: false, nullable: false
        end
    end
end
