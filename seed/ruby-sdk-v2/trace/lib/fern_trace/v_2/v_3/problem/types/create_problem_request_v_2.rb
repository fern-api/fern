# frozen_string_literal: true

module FernTrace
  module V2
    module V3
      module Problem
        module Types
          class CreateProblemRequestV2 < Internal::Types::Model
            field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
            field :problem_description, -> { FernTrace::Problem::Types::ProblemDescription }, optional: false, nullable: false, api_name: "problemDescription"
            field :custom_files, -> { FernTrace::V2::V3::Problem::Types::CustomFiles }, optional: false, nullable: false, api_name: "customFiles"
            field :custom_test_case_templates, -> { Internal::Types::Array[FernTrace::V2::V3::Problem::Types::TestCaseTemplate] }, optional: false, nullable: false, api_name: "customTestCaseTemplates"
            field :testcases, -> { Internal::Types::Array[FernTrace::V2::V3::Problem::Types::TestCaseV2] }, optional: false, nullable: false
            field :supported_languages, -> { Internal::Types::Array[FernTrace::Commons::Types::Language] }, optional: false, nullable: false, api_name: "supportedLanguages"
            field :is_public, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "isPublic"
          end
        end
      end
    end
  end
end
