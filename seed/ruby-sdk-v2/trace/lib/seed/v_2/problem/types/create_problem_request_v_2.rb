# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class CreateProblemRequestV2 < Internal::Types::Model
          field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
          field :problem_description, lambda {
            Seed::Problem::Types::ProblemDescription
          }, optional: false, nullable: false, api_name: "problemDescription"
          field :custom_files, lambda {
            Seed::V2::Problem::Types::CustomFiles
          }, optional: false, nullable: false, api_name: "customFiles"
          field :custom_test_case_templates, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::TestCaseTemplate]
          }, optional: false, nullable: false, api_name: "customTestCaseTemplates"
          field :testcases, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::TestCaseV2]
          }, optional: false, nullable: false
          field :supported_languages, lambda {
            Internal::Types::Array[Seed::Commons::Types::Language]
          }, optional: false, nullable: false, api_name: "supportedLanguages"
          field :is_public, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "isPublic"
        end
      end
    end
  end
end
