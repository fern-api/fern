# frozen_string_literal: true

module Seed
  module Types
    class V2V3GetGeneratedTestCaseFileRequest < Internal::Types::Model
      field :template, -> { Seed::Types::V2V3TestCaseTemplate }, optional: true, nullable: false
      field :test_case, -> { Seed::Types::V2V3TestCaseV2 }, optional: false, nullable: false, api_name: "testCase"
    end
  end
end
