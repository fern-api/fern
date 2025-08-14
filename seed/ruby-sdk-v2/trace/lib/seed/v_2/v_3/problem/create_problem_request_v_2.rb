# frozen_string_literal: true

module Seed
    module Types
        class CreateProblemRequestV2 < Internal::Types::Model
            field :problem_name, String, optional: false, nullable: false
            field :problem_description, Seed::Problem::ProblemDescription, optional: false, nullable: false
            field :custom_files, Seed::V2::V3::Problem::CustomFiles, optional: false, nullable: false
            field :custom_test_case_templates, Internal::Types::Array[Seed::V2::V3::Problem::TestCaseTemplate], optional: false, nullable: false
            field :testcases, Internal::Types::Array[Seed::V2::V3::Problem::TestCaseV2], optional: false, nullable: false
            field :supported_languages, Internal::Types::Array[Seed::Commons::Language], optional: false, nullable: false
            field :is_public, Internal::Types::Boolean, optional: false, nullable: false

    end
end
