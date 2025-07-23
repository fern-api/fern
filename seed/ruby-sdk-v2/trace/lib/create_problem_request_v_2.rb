# frozen_string_literal: true

module V2
    module Types
        class CreateProblemRequestV2 < Internal::Types::Model
            field :problem_name, String, optional: true, nullable: true
            field :problem_description, ProblemDescription, optional: true, nullable: true
            field :custom_files, CustomFiles, optional: true, nullable: true
            field :custom_test_case_templates, Array, optional: true, nullable: true
            field :testcases, Array, optional: true, nullable: true
            field :supported_languages, Array, optional: true, nullable: true
            field :is_public, Boolean, optional: true, nullable: true
        end
    end
end
