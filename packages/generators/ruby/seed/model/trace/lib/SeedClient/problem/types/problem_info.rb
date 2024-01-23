# frozen_string_literal: true

require_relative "../../commons/types/problem_id"
require_relative "problem_description"
require_relative "variable_type_and_name"
require_relative "../../commons/types/variable_type"
require_relative "../../commons/types/test_case_with_expected_result"
require "json"

module SeedClient
  module Problem
    class ProblemInfo
      attr_reader :problem_id, :problem_description, :problem_name, :problem_version, :files, :input_params,
                  :output_type, :testcases, :method_name, :supports_custom_test_cases, :additional_properties

      # @param problem_id [Commons::PROBLEM_ID]
      # @param problem_description [Problem::ProblemDescription]
      # @param problem_name [String]
      # @param problem_version [Integer]
      # @param files [Hash{LANGUAGE => LANGUAGE}]
      # @param input_params [Array<Problem::VariableTypeAndName>]
      # @param output_type [Commons::VariableType]
      # @param testcases [Array<Commons::TestCaseWithExpectedResult>]
      # @param method_name [String]
      # @param supports_custom_test_cases [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::ProblemInfo]
      def initialize(problem_id:, problem_description:, problem_name:, problem_version:, files:, input_params:,
                     output_type:, testcases:, method_name:, supports_custom_test_cases:, additional_properties: nil)
        # @type [Commons::PROBLEM_ID]
        @problem_id = problem_id
        # @type [Problem::ProblemDescription]
        @problem_description = problem_description
        # @type [String]
        @problem_name = problem_name
        # @type [Integer]
        @problem_version = problem_version
        # @type [Hash{LANGUAGE => LANGUAGE}]
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
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ProblemInfo
      #
      # @param json_object [JSON]
      # @return [Problem::ProblemInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_id = struct.problemId
        problem_description = struct.problemDescription.to_h.to_json
        problem_description = Problem::ProblemDescription.from_json(json_object: problem_description)
        problem_name = struct.problemName
        problem_version = struct.problemVersion
        files = struct.files.transform_values do |_k, v|
          v = v.to_h.to_json
          LANGUAGE.key(v)
        end
        input_params = struct.inputParams.map do |v|
          v = v.to_h.to_json
          Problem::VariableTypeAndName.from_json(json_object: v)
        end
        output_type = struct.outputType.to_h.to_json
        output_type = Commons::VariableType.from_json(json_object: output_type)
        testcases = struct.testcases.map do |v|
          v = v.to_h.to_json
          Commons::TestCaseWithExpectedResult.from_json(json_object: v)
        end
        method_name = struct.methodName
        supports_custom_test_cases = struct.supportsCustomTestCases
        new(problem_id: problem_id, problem_description: problem_description, problem_name: problem_name,
            problem_version: problem_version, files: files, input_params: input_params, output_type: output_type, testcases: testcases, method_name: method_name, supports_custom_test_cases: supports_custom_test_cases, additional_properties: struct)
      end

      # Serialize an instance of ProblemInfo to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "problemId": @problem_id,
          "problemDescription": @problem_description,
          "problemName": @problem_name,
          "problemVersion": @problem_version,
          "files": @files,
          "inputParams": @input_params,
          "outputType": @output_type,
          "testcases": @testcases,
          "methodName": @method_name,
          "supportsCustomTestCases": @supports_custom_test_cases
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        Problem::ProblemDescription.validate_raw(obj: obj.problem_description)
        obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
        obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
        obj.files.is_a?(Hash) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
        obj.input_params.is_a?(Array) != false || raise("Passed value for field obj.input_params is not the expected type, validation failed.")
        Commons::VariableType.validate_raw(obj: obj.output_type)
        obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
        obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
        obj.supports_custom_test_cases.is_a?(Boolean) != false || raise("Passed value for field obj.supports_custom_test_cases is not the expected type, validation failed.")
      end
    end
  end
end
