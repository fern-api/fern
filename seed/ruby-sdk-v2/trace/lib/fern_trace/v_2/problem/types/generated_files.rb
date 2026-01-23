# frozen_string_literal: true

module FernTrace
  module V2
    module Problem
      module Types
        class GeneratedFiles < Internal::Types::Model
          field :generated_test_case_files, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::Problem::Types::Files] }, optional: false, nullable: false, api_name: "generatedTestCaseFiles"
          field :generated_template_files, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::Problem::Types::Files] }, optional: false, nullable: false, api_name: "generatedTemplateFiles"
          field :other, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::V2::Problem::Types::Files] }, optional: false, nullable: false
        end
      end
    end
  end
end
