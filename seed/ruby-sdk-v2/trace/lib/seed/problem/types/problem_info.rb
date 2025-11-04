# frozen_string_literal: true

module Seed
  module Problem
    module Types
      class ProblemInfo < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :problem_description, lambda {
          Seed::Problem::Types::ProblemDescription
        }, optional: false, nullable: false, api_name: "problemDescription"
        field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
        field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
        field :files, lambda {
          Internal::Types::Hash[Seed::Commons::Types::Language, Seed::Problem::Types::ProblemFiles]
        }, optional: false, nullable: false
        field :input_params, lambda {
          Internal::Types::Array[Seed::Problem::Types::VariableTypeAndName]
        }, optional: false, nullable: false, api_name: "inputParams"
        field :output_type, lambda {
          Seed::Commons::Types::VariableType
        }, optional: false, nullable: false, api_name: "outputType"
        field :testcases, lambda {
          Internal::Types::Array[Seed::Commons::Types::TestCaseWithExpectedResult]
        }, optional: false, nullable: false
        field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
        field :supports_custom_test_cases, lambda {
          Internal::Types::Boolean
        }, optional: false, nullable: false, api_name: "supportsCustomTestCases"
      end
    end
  end
end
