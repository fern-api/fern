# frozen_string_literal: true

require_relative "traced_file"
require_relative "../../commons/types/debug_variable_value"
require_relative "expression_location"
require_relative "stack_information"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class TraceResponseV2
      # @return [String]
      attr_reader :submission_id
      # @return [Integer]
      attr_reader :line_number
      # @return [SeedTraceClient::Submission::TracedFile]
      attr_reader :file
      # @return [SeedTraceClient::Commons::DebugVariableValue]
      attr_reader :return_value
      # @return [SeedTraceClient::Submission::ExpressionLocation]
      attr_reader :expression_location
      # @return [SeedTraceClient::Submission::StackInformation]
      attr_reader :stack
      # @return [String]
      attr_reader :stdout
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param submission_id [String]
      # @param line_number [Integer]
      # @param file [SeedTraceClient::Submission::TracedFile]
      # @param return_value [SeedTraceClient::Commons::DebugVariableValue]
      # @param expression_location [SeedTraceClient::Submission::ExpressionLocation]
      # @param stack [SeedTraceClient::Submission::StackInformation]
      # @param stdout [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::TraceResponseV2]
      def initialize(submission_id:, line_number:, file:, stack:, return_value: OMIT, expression_location: OMIT,
                     stdout: OMIT, additional_properties: nil)
        @submission_id = submission_id
        @line_number = line_number
        @file = file
        @return_value = return_value if return_value != OMIT
        @expression_location = expression_location if expression_location != OMIT
        @stack = stack
        @stdout = stdout if stdout != OMIT
        @additional_properties = additional_properties
        @_field_set = {
          "submissionId": submission_id,
          "lineNumber": line_number,
          "file": file,
          "returnValue": return_value,
          "expressionLocation": expression_location,
          "stack": stack,
          "stdout": stdout
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TraceResponseV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TraceResponseV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        submission_id = parsed_json["submissionId"]
        line_number = parsed_json["lineNumber"]
        if parsed_json["file"].nil?
          file = nil
        else
          file = parsed_json["file"].to_json
          file = SeedTraceClient::Submission::TracedFile.from_json(json_object: file)
        end
        if parsed_json["returnValue"].nil?
          return_value = nil
        else
          return_value = parsed_json["returnValue"].to_json
          return_value = SeedTraceClient::Commons::DebugVariableValue.from_json(json_object: return_value)
        end
        if parsed_json["expressionLocation"].nil?
          expression_location = nil
        else
          expression_location = parsed_json["expressionLocation"].to_json
          expression_location = SeedTraceClient::Submission::ExpressionLocation.from_json(json_object: expression_location)
        end
        if parsed_json["stack"].nil?
          stack = nil
        else
          stack = parsed_json["stack"].to_json
          stack = SeedTraceClient::Submission::StackInformation.from_json(json_object: stack)
        end
        stdout = parsed_json["stdout"]
        new(
          submission_id: submission_id,
          line_number: line_number,
          file: file,
          return_value: return_value,
          expression_location: expression_location,
          stack: stack,
          stdout: stdout,
          additional_properties: struct
        )
      end

      # Serialize an instance of TraceResponseV2 to a JSON object
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
        obj.submission_id.is_a?(String) != false || raise("Passed value for field obj.submission_id is not the expected type, validation failed.")
        obj.line_number.is_a?(Integer) != false || raise("Passed value for field obj.line_number is not the expected type, validation failed.")
        SeedTraceClient::Submission::TracedFile.validate_raw(obj: obj.file)
        obj.return_value.nil? || SeedTraceClient::Commons::DebugVariableValue.validate_raw(obj: obj.return_value)
        obj.expression_location.nil? || SeedTraceClient::Submission::ExpressionLocation.validate_raw(obj: obj.expression_location)
        SeedTraceClient::Submission::StackInformation.validate_raw(obj: obj.stack)
        obj.stdout&.is_a?(String) != false || raise("Passed value for field obj.stdout is not the expected type, validation failed.")
      end
    end
  end
end
