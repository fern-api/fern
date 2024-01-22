# frozen_string_literal: true

require_relative "commons/types/VariableValue"
require_relative "submission/types/ExceptionV2"
require "json"

module SeedClient
  module Submission
    class TestCaseNonHiddenGrade
      attr_reader :passed, :actual_result, :exception, :stdout, :additional_properties

      # @param passed [Boolean]
      # @param actual_result [Commons::VariableValue]
      # @param exception [Submission::ExceptionV2]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TestCaseNonHiddenGrade]
      def initialze(passed:, stdout:, actual_result: nil, exception: nil, additional_properties: nil)
        # @type [Boolean]
        @passed = passed
        # @type [Commons::VariableValue]
        @actual_result = actual_result
        # @type [Submission::ExceptionV2]
        @exception = exception
        # @type [String]
        @stdout = stdout
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TestCaseNonHiddenGrade
      #
      # @param json_object [JSON]
      # @return [Submission::TestCaseNonHiddenGrade]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        passed struct.passed
        actual_result Commons::VariableValue.from_json(json_object: struct.actualResult)
        exception Submission::ExceptionV2.from_json(json_object: struct.exception)
        stdout struct.stdout
        new(passed: passed, actual_result: actual_result, exception: exception, stdout: stdout,
            additional_properties: struct)
      end

      # Serialize an instance of TestCaseNonHiddenGrade to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { passed: @passed, actualResult: @actual_result, exception: @exception, stdout: @stdout }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.passed.is_a?(Boolean) != false || raise("Passed value for field obj.passed is not the expected type, validation failed.")
        obj.actual_result.nil? || VariableValue.validate_raw(obj: obj.actual_result)
        obj.exception.nil? || ExceptionV2.validate_raw(obj: obj.exception)
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
