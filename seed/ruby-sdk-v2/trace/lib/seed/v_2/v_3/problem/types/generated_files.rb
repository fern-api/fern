# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class GeneratedFiles < Internal::Types::Model
            field :generated_test_case_files, lambda {
              Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::V3::Problem::Types::Files]
            }, optional: false, nullable: false, api_name: "generatedTestCaseFiles"
            field :generated_template_files, lambda {
              Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::V3::Problem::Types::Files]
            }, optional: false, nullable: false, api_name: "generatedTemplateFiles"
            field :other, lambda {
              Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::V3::Problem::Types::Files]
            }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
