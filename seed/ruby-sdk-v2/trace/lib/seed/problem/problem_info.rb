
module Seed
    module Types
        class ProblemInfo < Internal::Types::Model
            field :problem_id, , optional: false, nullable: false
            field :problem_description, , optional: false, nullable: false
            field :problem_name, , optional: false, nullable: false
            field :problem_version, , optional: false, nullable: false
            field :files, , optional: false, nullable: false
            field :input_params, , optional: false, nullable: false
            field :output_type, , optional: false, nullable: false
            field :testcases, , optional: false, nullable: false
            field :method_name, , optional: false, nullable: false
            field :supports_custom_test_cases, , optional: false, nullable: false
        end
    end
end
