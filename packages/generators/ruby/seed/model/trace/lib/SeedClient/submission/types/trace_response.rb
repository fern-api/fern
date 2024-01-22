# frozen_string_literal: true
require "submission/types/SubmissionId"
require "commons/types/DebugVariableValue"
require "submission/types/ExpressionLocation"
require "submission/types/StackInformation"
require "json"

module SeedClient
  module Submission
    class TraceResponse
      attr_reader :submission_id, :line_number, :return_value, :expression_location, :stack, :stdout, :additional_properties
      # @param submission_id [Submission::SubmissionId] 
      # @param line_number [Integer] 
      # @param return_value [Commons::DebugVariableValue] 
      # @param expression_location [Submission::ExpressionLocation] 
      # @param stack [Submission::StackInformation] 
      # @param stdout [String] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponse] 
      def initialze(submission_id:, line_number:, return_value: nil, expression_location: nil, stack:, stdout: nil, additional_properties: nil)
        # @type [Submission::SubmissionId] 
        @submission_id = submission_id
        # @type [Integer] 
        @line_number = line_number
        # @type [Commons::DebugVariableValue] 
        @return_value = return_value
        # @type [Submission::ExpressionLocation] 
        @expression_location = expression_location
        # @type [Submission::StackInformation] 
        @stack = stack
        # @type [String] 
        @stdout = stdout
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of TraceResponse
      #
      # @param json_object [JSON] 
      # @return [Submission::TraceResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id Submission::SubmissionId.from_json(json_object: struct.submissionId)
        line_number struct.lineNumber
        return_value Commons::DebugVariableValue.from_json(json_object: struct.returnValue)
        expression_location Submission::ExpressionLocation.from_json(json_object: struct.expressionLocation)
        stack Submission::StackInformation.from_json(json_object: struct.stack)
        stdout struct.stdout
        new(submission_id: submission_id, line_number: line_number, return_value: return_value, expression_location: expression_location, stack: stack, stdout: stdout, additional_properties: struct)
      end
      # Serialize an instance of TraceResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        { submissionId: @submission_id, lineNumber: @line_number, returnValue: @return_value, expressionLocation: @expression_location, stack: @stack, stdout: @stdout }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        SubmissionId.validate_raw(obj: obj.submission_id)
        obj.line_number.is_a?(Integer) != false || raise("Passed value for field obj.line_number is not the expected type, validation failed.")
        obj.return_value.nil?() || DebugVariableValue.validate_raw(obj: obj.return_value)
        obj.expression_location.nil?() || ExpressionLocation.validate_raw(obj: obj.expression_location)
        StackInformation.validate_raw(obj: obj.stack)
        obj.stdout&.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end