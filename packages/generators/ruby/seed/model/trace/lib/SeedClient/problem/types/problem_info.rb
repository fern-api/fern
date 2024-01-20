# frozen_string_literal: true
require_relative "commons/types/ProblemId"
require_relative "problem/types/ProblemDescription"
require_relative "problem/types/VariableTypeAndName"
require_relative "commons/types/VariableType"
require_relative "commons/types/TestCaseWithExpectedResult"
require "json"

module SeedClient
  module Problem
    class ProblemInfo
      attr_reader :problem_id, :problem_description, :problem_name, :problem_version, :files, :input_params, :output_type, :testcases, :method_name, :supports_custom_test_cases, :additional_properties
      # @param problem_id [Commons::ProblemId] 
      # @param problem_description [Problem::ProblemDescription] 
      # @param problem_name [String] 
      # @param problem_version [Integer] 
      # @param files [Hash{Commons::Language => Commons::Language}] 
      # @param input_params [Array<Problem::VariableTypeAndName>] 
      # @param output_type [Commons::VariableType] 
      # @param testcases [Array<Commons::TestCaseWithExpectedResult>] 
      # @param method_name [String] 
      # @param supports_custom_test_cases [Boolean] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::ProblemInfo] 
      def initialze(problem_id:, problem_description:, problem_name:, problem_version:, files:, input_params:, output_type:, testcases:, method_name:, supports_custom_test_cases:, additional_properties: nil)
        # @type [Commons::ProblemId] 
        @problem_id = problem_id
        # @type [Problem::ProblemDescription] 
        @problem_description = problem_description
        # @type [String] 
        @problem_name = problem_name
        # @type [Integer] 
        @problem_version = problem_version
        # @type [Hash{Commons::Language => Commons::Language}] 
        @files = files
        # @type [Array<Problem::VariableTypeAndName>] 
        @input_params = input_params
        # @type [Commons::VariableType] 
        @output_type = output_type
        # @type [Array<Commons::TestCaseWithExpectedResult>] 
        @testcases = testcases
        # @type [String] 
        @method_name = method_name
        # @type [Boolean] 
        @supports_custom_test_cases = supports_custom_test_cases
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ProblemInfo
      #
      # @param json_object [JSON] 
      # @return [Problem::ProblemInfo] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id = Commons::ProblemId.from_json(json_object: struct.problemId)
        problem_description = Problem::ProblemDescription.from_json(json_object: struct.problemDescription)
        problem_name = struct.problemName
        problem_version = struct.problemVersion
        files = struct.files.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
        input_params = struct.inputParams.map() do | v |
 Problem::VariableTypeAndName.from_json(json_object: v)
end
        output_type = Commons::VariableType.from_json(json_object: struct.outputType)
        testcases = struct.testcases.map() do | v |
 Commons::TestCaseWithExpectedResult.from_json(json_object: v)
end
        method_name = struct.methodName
        supports_custom_test_cases = struct.supportsCustomTestCases
        new(problem_id: problem_id, problem_description: problem_description, problem_name: problem_name, problem_version: problem_version, files: files, input_params: input_params, output_type: output_type, testcases: testcases, method_name: method_name, supports_custom_test_cases: supports_custom_test_cases, additional_properties: struct)
      end
      # Serialize an instance of ProblemInfo to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 problemId: @problem_id,
 problemDescription: @problem_description,
 problemName: @problem_name,
 problemVersion: @problem_version,
 files: @files.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend,
 inputParams: @input_params,
 outputType: @output_type,
 testcases: @testcases,
 methodName: @method_name,
 supportsCustomTestCases: @supports_custom_test_cases
}.to_json()
      end
    end
  end
end