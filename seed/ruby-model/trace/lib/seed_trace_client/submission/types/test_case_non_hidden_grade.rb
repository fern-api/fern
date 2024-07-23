# frozen_string_literal: true

require_relative "../../commons/types/variable_value"
require_relative "exception_v_2"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TestCaseNonHiddenGrade
      # @return [Boolean]
      attr_reader :passed
      # @return [SeedTraceClient::Commons::VariableValue]
      attr_reader :actual_result
      # @return [SeedTraceClient::Submission::ExceptionV2]
      attr_reader :exception
      # @return [String]
      attr_reader :stdout
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param passed [Boolean]
      # @param actual_result [SeedTraceClient::Commons::VariableValue]
      # @param exception [SeedTraceClient::Submission::ExceptionV2]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TestCaseNonHiddenGrade]
      def initialize(passed:, stdout:, actual_result: OMIT, exception: OMIT, additional_properties: nil)
        @passed = passed
        @actual_result = actual_result if actual_result != OMIT
        @exception = exception if exception != OMIT
        @stdout = stdout
        @additional_properties = additional_properties
        @_field_set = {
          "passed": passed,
          "actualResult": actual_result,
          "exception": exception,
          "stdout": stdout
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TestCaseNonHiddenGrade
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestCaseNonHiddenGrade]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        passed = parsed_json["passed"]
        if parsed_json["actualResult"].nil?
          actual_result = nil
        else
          actual_result = parsed_json["actualResult"].to_json
          actual_result = SeedTraceClient::Commons::VariableValue.from_json(json_object: actual_result)
        end
        if parsed_json["exception"].nil?
          exception = nil
        else
          exception = parsed_json["exception"].to_json
          exception = SeedTraceClient::Submission::ExceptionV2.from_json(json_object: exception)
        end
        stdout = parsed_json["stdout"]
        new(
          passed: passed,
          actual_result: actual_result,
          exception: exception,
          stdout: stdout,
          additional_properties: struct
        )
      end

      # Serialize an instance of TestCaseNonHiddenGrade to a JSON object
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
        obj.passed.is_a?(Boolean) != false || raise("Passed value for field obj.passed is not the expected type, validation failed.")
        obj.actual_result.nil? || SeedTraceClient::Commons::VariableValue.validate_raw(obj: obj.actual_result)
        obj.exception.nil? || SeedTraceClient::Submission::ExceptionV2.validate_raw(obj: obj.exception)
        obj.stdout.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
