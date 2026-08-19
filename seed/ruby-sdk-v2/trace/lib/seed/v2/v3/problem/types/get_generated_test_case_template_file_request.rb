# frozen_string_literal: true

module Seed
  module V2
    module V3
      module Problem
        module Types
          class GetGeneratedTestCaseTemplateFileRequest < Internal::Types::Model
            field :template, -> { Seed::V2::V3::Problem::Types::TestCaseTemplate }, optional: false, nullable: false
          end
        end
      end
    end
  end
end
