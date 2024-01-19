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
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ExceptionInfo
      #
      # @param json_object [JSON] 
      # @return [Submission::ExceptionInfo] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        exception_type = struct.exceptionType
        exception_message = struct.exceptionMessage
        exception_stacktrace = struct.exceptionStacktrace
        new(exception_type: exception_type, exception_message: exception_message, exception_stacktrace: exception_stacktrace, additional_properties: struct)
      end
      # Serialize an instance of ExceptionInfo to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 exceptionType: @exception_type,
 exceptionMessage: @exception_message,
 exceptionStacktrace: @exception_stacktrace
}.to_json()
      end
    end
  end
end