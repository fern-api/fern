# frozen_string_literal: true

module Seed
  module Types
    class V2V3ProblemInfoV2 < Internal::Types::Model
      field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
      field :problem_description, -> { Seed::Types::ProblemDescription }, optional: false, nullable: false, api_name: "problemDescription"
      field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
      field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
      field :supported_languages, -> { Internal::Types::Array[Seed::Types::Language] }, optional: false, nullable: false, api_name: "supportedLanguages"
      field :custom_files, -> { Seed::Types::V2V3CustomFiles }, optional: false, nullable: false, api_name: "customFiles"
      field :generated_files, -> { Seed::Types::V2V3GeneratedFiles }, optional: false, nullable: false, api_name: "generatedFiles"
      field :custom_test_case_templates, -> { Internal::Types::Array[Seed::Types::V2V3TestCaseTemplate] }, optional: false, nullable: false, api_name: "customTestCaseTemplates"
      field :testcases, -> { Internal::Types::Array[Seed::Types::V2V3TestCaseV2] }, optional: false, nullable: false
      field :is_public, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "isPublic"
    end
  end
end
