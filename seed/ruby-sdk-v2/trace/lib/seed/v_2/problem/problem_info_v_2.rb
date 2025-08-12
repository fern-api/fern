
module Seed
    module Types
        class ProblemInfoV2 < Internal::Types::Model
            field :problem_id, , optional: false, nullable: false
            field :problem_description, , optional: false, nullable: false
            field :problem_name, , optional: false, nullable: false
            field :problem_version, , optional: false, nullable: false
            field :supported_languages, , optional: false, nullable: false
            field :custom_files, , optional: false, nullable: false
            field :generated_files, , optional: false, nullable: false
            field :custom_test_case_templates, , optional: false, nullable: false
            field :testcases, , optional: false, nullable: false
            field :is_public, , optional: false, nullable: false
        end
    end
end
