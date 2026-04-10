# frozen_string_literal: true

module Seed
  module Types
    class CreateProblemRequest < Internal::Types::Model
      field :problem_name, -> { String }, optional: false, nullable: false, api_name: "problemName"
      field :problem_description, -> { Seed::Types::ProblemDescription }, optional: false, nullable: false, api_name: "problemDescription"
      field :files, -> { Internal::Types::Hash[String, Seed::Types::ProblemFiles] }, optional: false, nullable: false
      field :input_params, -> { Internal::Types::Array[Seed::Types::VariableTypeAndName] }, optional: false, nullable: false, api_name: "inputParams"
      field :output_type, -> { Seed::Types::VariableType }, optional: false, nullable: false, api_name: "outputType"
      field :testcases, -> { Internal::Types::Array[Seed::Types::TestCaseWithExpectedResult] }, optional: false, nullable: false
      field :method_name, -> { String }, optional: false, nullable: false, api_name: "methodName"
    end
  end
end
