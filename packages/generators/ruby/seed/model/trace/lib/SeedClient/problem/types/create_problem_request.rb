# frozen_string_literal: true

require_relative "problem/types/ProblemDescription"
require_relative "problem/types/VariableTypeAndName"
require_relative "commons/types/VariableType"
require_relative "commons/types/TestCaseWithExpectedResult"
require "json"

module SeedClient
  module Problem
    class CreateProblemRequest
      attr_reader :problem_name, :problem_description, :files, :input_params, :output_type, :testcases, :method_name,
                  :additional_properties

      # @param problem_name [String]
      # @param problem_description [Problem::ProblemDescription]
      # @param files [Hash{LANGUAGE => LANGUAGE}]
      # @param input_params [Array<Problem::VariableTypeAndName>]
      # @param output_type [Commons::VariableType]
      # @param testcases [Array<Commons::TestCaseWithExpectedResult>]
      # @param method_name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::CreateProblemRequest]
      def initialze(problem_name:, problem_description:, files:, input_params:, output_type:, testcases:, method_name:,
                    additional_properties: nil)
        # @type [String]
        @problem_name = problem_name
        # @type [Problem::ProblemDescription]
        @problem_description = problem_description
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
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of CreateProblemRequest
      #
      # @param json_object [JSON]
      # @return [Problem::CreateProblemRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        problem_name = struct.problemName
        problem_description = Problem::ProblemDescription.from_json(json_object: struct.problemDescription)
        files = struct.files.transform_values do |v|
          LANGUAGE.key(v)
        end
        input_params = struct.inputParams.map do |v|
          Problem::VariableTypeAndName.from_json(json_object: v)
        end
        output_type = Commons::VariableType.from_json(json_object: struct.outputType)
        testcases = struct.testcases.map do |v|
          Commons::TestCaseWithExpectedResult.from_json(json_object: v)
        end
        method_name = struct.methodName
        new(problem_name: problem_name, problem_description: problem_description, files: files,
            input_params: input_params, output_type: output_type, testcases: testcases, method_name: method_name, additional_properties: struct)
      end

      # Serialize an instance of CreateProblemRequest to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "problemName": @problem_name, "problemDescription": @problem_description, "files": @files.transform_values do |v|
                                                                                               LANGUAGE.key(v)
                                                                                             end, "inputParams": @input_params, "outputType": @output_type, "testcases": @testcases, "methodName": @method_name }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.problem_name.is_a?(String) != false || raise("Passed value for field obj.problem_name is not the expected type, validation failed.")
        Problem::ProblemDescription.validate_raw(obj: obj.problem_description)
        obj.files.is_a?(Hash) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
        obj.input_params.is_a?(Array) != false || raise("Passed value for field obj.input_params is not the expected type, validation failed.")
        Commons::VariableType.validate_raw(obj: obj.output_type)
        obj.testcases.is_a?(Array) != false || raise("Passed value for field obj.testcases is not the expected type, validation failed.")
        obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
      end
    end
  end
end
