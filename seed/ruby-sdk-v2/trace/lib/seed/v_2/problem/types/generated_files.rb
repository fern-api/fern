# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class GeneratedFiles < Internal::Types::Model
          field :generated_test_case_files, lambda {
            Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::Problem::Types::Files]
          }, optional: false, nullable: false
          field :generated_template_files, lambda {
            Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::Problem::Types::Files]
          }, optional: false, nullable: false
          field :other, lambda {
            Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::Problem::Types::Files]
          }, optional: false, nullable: false
        end
      end
    end
  end
end
