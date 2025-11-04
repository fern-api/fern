# frozen_string_literal: true

module Seed
  module V2
    module Problem
      module Types
        class BasicCustomFiles < Internal::Types::Model
          field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
          field :signature, -> { Seed::V2::Problem::Types::NonVoidFunctionSignature }, optional: false, nullable: false
          field :additional_files, lambda {
            Internal::Types::Hash[Seed::Commons::Types::Language, Seed::V2::Problem::Types::Files]
          }, optional: false, nullable: false, api_name: "additionalFiles"
          field :basic_test_case_template, lambda {
            Seed::V2::Problem::Types::BasicTestCaseTemplate
          }, optional: false, nullable: false, api_name: "basicTestCaseTemplate"
        end
      end
    end
  end
end
