# frozen_string_literal: true
require "commons/types/VariableValue"
require "submission/types/ExceptionV2"
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
      def initialze(passed:, actual_result: nil, exception: nil, stdout:, additional_properties: nil)
        # @type [Boolean] 
        @passed = passed
        # @type [Commons::VariableValue] 
        @actual_result = actual_result
        # @type [Submission::ExceptionV2] 
        @exception = exception
        # @type [String] 
        @stdout = stdout
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of TestCaseNonHiddenGrade
      #
      # @param json_object [JSON] 
      # @return [Submission::TestCaseNonHiddenGrade] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        passed = struct.passed
        actual_result = Commons::VariableValue.from_json(json_object: struct.actualResult)
        exception = Submission::ExceptionV2.from_json(json_object: struct.exception)
        stdout = struct.stdout
        new(passed: passed, actual_result: actual_result, exception: exception, stdout: stdout, additional_properties: struct)
      end
      # Serialize an instance of TestCaseNonHiddenGrade to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 passed: @passed,
 actualResult: @actual_result,
 exception: @exception,
 stdout: @stdout
}.to_json()
      end
    end
  end
end