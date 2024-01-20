# frozen_string_literal: true

require_relative "submission/types/SubmissionId"
require_relative "submission/types/TracedFile"
require_relative "commons/types/DebugVariableValue"
require_relative "submission/types/ExpressionLocation"
require_relative "submission/types/StackInformation"
require "json"

module SeedClient
  module Submission
    class TraceResponseV2
      attr_reader :submission_id, :line_number, :file, :return_value, :expression_location, :stack, :stdout,
                  :additional_properties

      # @param submission_id [Submission::SubmissionId]
      # @param line_number [Integer]
      # @param file [Submission::TracedFile]
      # @param return_value [Commons::DebugVariableValue]
      # @param expression_location [Submission::ExpressionLocation]
      # @param stack [Submission::StackInformation]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TraceResponseV2]
      def initialze(submission_id:, line_number:, file:, stack:, return_value: nil, expression_location: nil,
                    stdout: nil, additional_properties: nil)
        # @type [Submission::SubmissionId]
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
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TraceResponseV2
      #
      # @param json_object [JSON]
      # @return [Submission::TraceResponseV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        submission_id = Submission::SubmissionId.from_json(json_object: struct.submissionId)
        line_number = struct.lineNumber
        file = Submission::TracedFile.from_json(json_object: struct.file)
        return_value = Commons::DebugVariableValue.from_json(json_object: struct.returnValue)
        expression_location = Submission::ExpressionLocation.from_json(json_object: struct.expressionLocation)
        stack = Submission::StackInformation.from_json(json_object: struct.stack)
        stdout = struct.stdout
        new(submission_id: submission_id, line_number: line_number, file: file, return_value: return_value,
            expression_location: expression_location, stack: stack, stdout: stdout, additional_properties: struct)
      end

      # Serialize an instance of TraceResponseV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          submissionId: @submission_id,
          lineNumber: @line_number,
          file: @file,
          returnValue: @return_value,
          expressionLocation: @expression_location,
          stack: @stack,
          stdout: @stdout
        }.to_json
      end
    end
  end
end
