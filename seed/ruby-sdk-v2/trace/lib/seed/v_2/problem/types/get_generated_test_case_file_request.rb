# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class GetGeneratedTestCaseFileRequest < Internal::Types::Model
          field :template, -> { Seed::V2::Problem::Types::TestCaseTemplate }, optional: true, nullable: false
          field :test_case, lambda {
            Seed::V2::Problem::Types::TestCaseV2
          }, optional: false, nullable: false, api_name: "testCase"
        end
      end
    end
  end
end
