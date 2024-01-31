# frozen_string_literal: true

require_relative "submission_id"
require_relative "traced_file"
require_relative "../../commons/types/debug_variable_value"
require_relative "expression_location"
require_relative "stack_information"
require "json"

module SeedTraceClient
  module Submission
    class TraceResponseV2
      attr_reader :submission_id, :line_number, :file, :return_value, :expression_location, :stack, :stdout,
                  :additional_properties

      # @param submission_id [Submission::SUBMISSION_ID]
      # @param line_number [Integer]
      # @param file [Submission::TracedFile]
      # @param return_value [Commons::DebugVariableValue]
      # @param expression_location [Submission::ExpressionLocation]
      # @param stack [Submission::StackInformation]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponseV2]
      def initialize(submission_id:, line_number:, file:, stack:, return_value: nil, expression_location: nil,
                     stdout: nil, additional_properties: nil)
        # @type [Submission::SUBMISSION_ID]
        @submission_id = submission_id
        # @type [Integer]
        @line_number = line_number
        # @type [Submission::TracedFile]
        @file = file
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

      # Deserialize a JSON object to an instance of TraceResponseV2
      #
      # @param json_object [JSON]
      # @return [Submission::TraceResponseV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = struct.submissionId
        line_number = struct.lineNumber
        file = struct.file.to_h.to_json
        file = Submission::TracedFile.from_json(json_object: file)
        return_value = struct.returnValue.to_h.to_json
        return_value = Commons::DebugVariableValue.from_json(json_object: return_value)
        expression_location = struct.expressionLocation.to_h.to_json
        expression_location = Submission::ExpressionLocation.from_json(json_object: expression_location)
        stack = struct.stack.to_h.to_json
        stack = Submission::StackInformation.from_json(json_object: stack)
        stdout = struct.stdout
        new(submission_id: submission_id, line_number: line_number, file: file, return_value: return_value,
            expression_location: expression_location, stack: stack, stdout: stdout, additional_properties: struct)
      end

      # Serialize an instance of TraceResponseV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "submissionId": @submission_id,
          "lineNumber": @line_number,
          "file": @file,
          "returnValue": @return_value,
          "expressionLocation": @expression_location,
          "stack": @stack,
          "stdout": @stdout
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.submission_id.is_a?(UUID) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.line_number.is_a?(Integer) != false || raise("Passed value for field obj.line_number is not the expected type, validation failed.")
        Submission::TracedFile.validate_raw(obj: obj.file)
        obj.return_value.nil? || Commons::DebugVariableValue.validate_raw(obj: obj.return_value)
        obj.expression_location.nil? || Submission::ExpressionLocation.validate_raw(obj: obj.expression_location)
        Submission::StackInformation.validate_raw(obj: obj.stack)
        obj.stdout&.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
