# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class ExceptionInfo
      attr_reader :exception_type, :exception_message, :exception_stacktrace, :additional_properties

      # @param exception_type [String]
      # @param exception_message [String]
      # @param exception_stacktrace [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::ExceptionInfo]
      def initialze(exception_type:, exception_message:, exception_stacktrace:, additional_properties: nil)
        # @type [String]
        @exception_type = exception_type
        # @type [String]
        @exception_message = exception_message
        # @type [String]
        @exception_stacktrace = exception_stacktrace
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ExceptionInfo
      #
      # @param json_object [JSON]
      # @return [Submission::ExceptionInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        exception_type struct.exceptionType
        exception_message struct.exceptionMessage
        exception_stacktrace struct.exceptionStacktrace
        new(exception_type: exception_type, exception_message: exception_message,
            exception_stacktrace: exception_stacktrace, additional_properties: struct)
      end

      # Serialize an instance of ExceptionInfo to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { exceptionType: @exception_type, exceptionMessage: @exception_message,
          exceptionStacktrace: @exception_stacktrace }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.exception_type.is_a?(String) != false || raise("Passed value for field obj.exception_type is not the expected type, validation failed.")
        obj.exception_message.is_a?(String) != false || raise("Passed value for field obj.exception_message is not the expected type, validation failed.")
        obj.exception_stacktrace.is_a?(String) != false || raise("Passed value for field obj.exception_stacktrace is not the expected type, validation failed.")
      end
    end
  end
end
