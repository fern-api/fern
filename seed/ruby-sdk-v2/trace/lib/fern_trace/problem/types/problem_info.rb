# frozen_string_literal: true

module FernTrace
  module Problem
    module Types
      class ProblemInfo < Internal::Types::Model
        field :problem_id, -> { String }, optional: false, nullable: false, api_name: "problemId"
        field :problem_description, -> { FernTrace::Problem::Types::ProblemDescription }, optional: false, nullable: false, api_name: "problemDescription"
        field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
        field :problem_version, -> { Integer }, optional: false, nullable: false, api_name: "problemVersion"
        field :files, -> { Internal::Types::Hash[FernTrace::Commons::Types::Language, FernTrace::Problem::Types::ProblemFiles] }, optional: false, nullable: false
        field :input_params, -> { Internal::Types::Array[FernTrace::Problem::Types::VariableTypeAndName] }, optional: false, nullable: false, api_name: "inputParams"
        field :output_type, -> { FernTrace::Commons::Types::VariableType }, optional: false, nullable: false, api_name: "outputType"
        field :testcases, -> { Internal::Types::Array[FernTrace::Commons::Types::TestCaseWithExpectedResult] }, optional: false, nullable: false
        field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
        field :supports_custom_test_cases, -> { Internal::Types::Boolean }, optional: false, nullable: false, api_name: "supportsCustomTestCases"
      end
    end
  end
end
