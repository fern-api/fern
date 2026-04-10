# frozen_string_literal: true

module Seed
  module Types
    class V2GetGeneratedTestCaseFileRequest < Internal::Types::Model
      field :template, -> { Seed::Types::V2TestCaseTemplate }, optional: true, nullable: false
      field :test_case, -> { Seed::Types::V2TestCaseV2 }, optional: false, nullable: false, api_name: "testCase"
    end
  end
end
