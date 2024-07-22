# frozen_string_literal: true

require_relative "problem_description"
require_relative "variable_type_and_name"
require_relative "../../commons/types/variable_type"
require_relative "../../commons/types/test_case_with_expected_result"
require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class ProblemInfo
      # @return [String]
      attr_reader :problem_id
      # @return [SeedTraceClient::Problem::ProblemDescription]
      attr_reader :problem_description
      # @return [String]
      attr_reader :problem_name
      # @return [Integer]
      attr_reader :problem_version
      # @return [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles}]
      attr_reader :files
      # @return [Array<SeedTraceClient::Problem::VariableTypeAndName>]
      attr_reader :input_params
      # @return [SeedTraceClient::Commons::VariableType]
      attr_reader :output_type
      # @return [Array<SeedTraceClient::Commons::TestCaseWithExpectedResult>]
      attr_reader :testcases
      # @return [String]
      attr_reader :method_name
      # @return [Boolean]
      attr_reader :supports_custom_test_cases
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param problem_id [String]
      # @param problem_description [SeedTraceClient::Problem::ProblemDescription]
      # @param problem_name [String]
      # @param problem_version [Integer]
      # @param files [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles}]
      # @param input_params [Array<SeedTraceClient::Problem::VariableTypeAndName>]
      # @param output_type [SeedTraceClient::Commons::VariableType]
      # @param testcases [Array<SeedTraceClient::Commons::TestCaseWithExpectedResult>]
      # @param method_name [String]
      # @param supports_custom_test_cases [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Problem::ProblemInfo]
      def initialize(problem_id:, problem_description:, problem_name:, problem_version:, files:, input_params:,
                     output_type:, testcases:, method_name:, supports_custom_test_cases:, additional_properties: nil)
        @problem_id = problem_id
        @problem_description = problem_description
        @problem_name = problem_name
        @problem_version = problem_version
        @files = files
        @input_params = input_params
        @output_type = output_type
        @testcases = testcases
        @method_name = method_name
        @supports_custom_test_cases = supports_custom_test_cases
        @additional_properties = additional_properties
        @_field_set = {
          "problemId": problem_id,
          "problemDescription": problem_description,
          "problemName": problem_name,
          "problemVersion": problem_version,
          "files": files,
          "inputParams": input_params,
          "outputType": output_type,
          "testcases": testcases,
          "methodName": method_name,
          "supportsCustomTestCases": supports_custom_test_cases
        }
      end

      # Deserialize a JSON object to an instance of ProblemInfo
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::ProblemInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        problem_id = parsed_json["problemId"]
        if parsed_json["problemDescription"].nil?
          problem_description = nil
        else
          problem_description = parsed_json["problemDescription"].to_json
          problem_description = SeedTraceClient::Problem::ProblemDescription.from_json(json_object: problem_description)
        end
        problem_name = parsed_json["problemName"]
        problem_version = parsed_json["problemVersion"]
        files = parsed_json["files"]&.transform_values do |value|
          value = value.to_json
          SeedTraceClient::Problem::ProblemFiles.from_json(json_object: value)
        end
        input_params = parsed_json["inputParams"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Problem::VariableTypeAndName.from_json(json_object: item)
        end
        if parsed_json["outputType"].nil?
          output_type = nil
        else
          output_type = parsed_json["outputType"].to_json
          output_type = SeedTraceClient::Commons::VariableType.from_json(json_object: output_type)
        end
        testcases = parsed_json["testcases"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Commons::TestCaseWithExpectedResult.from_json(json_object: item)
        end
        method_name = parsed_json["methodName"]
        supports_custom_test_cases = parsed_json["supportsCustomTestCases"]
        new(
          problem_id: problem_id,
          problem_description: problem_description,
          problem_name: problem_name,
          problem_version: problem_version,
          files: files,
          input_params: input_params,
          output_type: output_type,
          testcases: testcases,
          method_name: method_name,
          supports_custom_test_cases: supports_custom_test_cases,
          additional_properties: struct
        )
      end

      # Serialize an instance of ProblemInfo to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.problem_id.is_a?(String) != false || raise("Passed value for field obj.problem_id is not the expected type, validation failed.")
        SeedTraceClient::Problem::ProblemDescription.validate_raw(obj: obj.problem_description)
        obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
        obj.problem_version.is_a?(Integer) != false || raise("Passed value for field obj.problem_version is not the expected type, validation failed.")
        obj.files.is_a?(Hash) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
        obj.input_params.is_a?(Array) != false || raise("Passed value for field obj.input_params is not the expected type, validation failed.")
        SeedTraceClient::Commons::VariableType.validate_raw(obj: obj.output_type)
        obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
        obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
        obj.supports_custom_test_cases.is_a?(Boolean) != false || raise("Passed value for field obj.supports_custom_test_cases is not the expected type, validation failed.")
      end
    end
  end
end
