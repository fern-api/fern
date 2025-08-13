# frozen_string_literal: true

module Seed
    module Types
        class ProblemInfoV2 < Internal::Types::Model
            field :problem_id, String, optional: false, nullable: false
            field :problem_description, Seed::Problem::ProblemDescription, optional: false, nullable: false
            field :problem_name, String, optional: false, nullable: false
            field :problem_version, Integer, optional: false, nullable: false
            field :supported_languages, Internal::Types::Array[Seed::Commons::Language], optional: false, nullable: false
            field :custom_files, Seed::V2::Problem::CustomFiles, optional: false, nullable: false
            field :generated_files, Seed::V2::Problem::GeneratedFiles, optional: false, nullable: false
            field :custom_test_case_templates, Internal::Types::Array[Seed::V2::Problem::TestCaseTemplate], optional: false, nullable: false
            field :testcases, Internal::Types::Array[Seed::V2::Problem::TestCaseV2], optional: false, nullable: false
            field :is_public, Internal::Types::Boolean, optional: false, nullable: false

    end
end
