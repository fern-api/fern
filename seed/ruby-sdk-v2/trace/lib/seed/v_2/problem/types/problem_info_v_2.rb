# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class ProblemInfoV2 < Internal::Types::Model
          field :problem_id, -> { String }, optional: false, nullable: false
          field :problem_description, -> { Seed::Problem::Types::ProblemDescription }, optional: false, nullable: false
          field :problem_name, -> { String }, optional: false, nullable: false
          field :problem_version, -> { Integer }, optional: false, nullable: false
          field :supported_languages, lambda {
            Internal::Types::Array[Seed::Commons::Types::Language]
          }, optional: false, nullable: false
          field :custom_files, -> { Seed::V2::Problem::Types::CustomFiles }, optional: false, nullable: false
          field :generated_files, -> { Seed::V2::Problem::Types::GeneratedFiles }, optional: false, nullable: false
          field :custom_test_case_templates, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::TestCaseTemplate]
          }, optional: false, nullable: false
          field :testcases, lambda {
            Internal::Types::Array[Seed::V2::Problem::Types::TestCaseV2]
          }, optional: false, nullable: false
          field :is_public, -> { Internal::Types::Boolean }, optional: false, nullable: false
        end
      end
    end
  end
end
