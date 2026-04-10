# frozen_string_literal: true

module Seed
  module Types
    class V2BasicCustomFiles < Internal::Types::Model
      field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
      field :signature, -> { Seed::Types::V2NonVoidFunctionSignature }, optional: false, nullable: false
      field :additional_files, -> { Internal::Types::Hash[String, Seed::Types::V2Files] }, optional: false, nullable: false, api_name: "additionalFiles"
      field :basic_test_case_template, -> { Seed::Types::V2BasicTestCaseTemplate }, optional: false, nullable: false, api_name: "basicTestCaseTemplate"
    end
  end
end
