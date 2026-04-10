# frozen_string_literal: true

module Seed
  module Types
    class V2V3GeneratedFiles < Internal::Types::Model
      field :generated_test_case_files, -> { Internal::Types::Hash[String, Seed::Types::V2V3Files] }, optional: false, nullable: false, api_name: "generatedTestCaseFiles"
      field :generated_template_files, -> { Internal::Types::Hash[String, Seed::Types::V2V3Files] }, optional: false, nullable: false, api_name: "generatedTemplateFiles"
      field :other, -> { Internal::Types::Hash[String, Seed::Types::V2V3Files] }, optional: false, nullable: false
    end
  end
end
