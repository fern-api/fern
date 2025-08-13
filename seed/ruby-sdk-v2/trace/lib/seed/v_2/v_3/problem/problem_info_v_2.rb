
module Seed
    module Types
        class ProblemInfoV2 < Internal::Types::Model
            field :problem_id, String, optional: false, nullable: false
            field :problem_description, Seed::problem::ProblemDescription, optional: false, nullable: false
            field :problem_name, String, optional: false, nullable: false
            field :problem_version, Integer, optional: false, nullable: false
            field :supported_languages, Internal::Types::Array[Seed::commons::Language], optional: false, nullable: false
            field :custom_files, Seed::v_2::v_3::problem::CustomFiles, optional: false, nullable: false
            field :generated_files, Seed::v_2::v_3::problem::GeneratedFiles, optional: false, nullable: false
            field :custom_test_case_templates, Internal::Types::Array[Seed::v_2::v_3::problem::TestCaseTemplate], optional: false, nullable: false
            field :testcases, Internal::Types::Array[Seed::v_2::v_3::problem::TestCaseV2], optional: false, nullable: false
            field :is_public, Internal::Types::Boolean, optional: false, nullable: false

    end
end
