# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class ExceptionInfo
      # @return [String]
      attr_reader :exception_type
      # @return [String]
      attr_reader :exception_message
      # @return [String]
      attr_reader :exception_stacktrace
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param exception_type [String]
      # @param exception_message [String]
      # @param exception_stacktrace [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::ExceptionInfo]
      def initialize(exception_type:, exception_message:, exception_stacktrace:, additional_properties: nil)
        @exception_type = exception_type
        @exception_message = exception_message
        @exception_stacktrace = exception_stacktrace
        @additional_properties = additional_properties
        @_field_set = {
          "exceptionType": exception_type,
          "exceptionMessage": exception_message,
          "exceptionStacktrace": exception_stacktrace
        }
      end

      # Deserialize a JSON object to an instance of ExceptionInfo
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::ExceptionInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        exception_type = parsed_json["exceptionType"]
        exception_message = parsed_json["exceptionMessage"]
        exception_stacktrace = parsed_json["exceptionStacktrace"]
        new(
          exception_type: exception_type,
          exception_message: exception_message,
          exception_stacktrace: exception_stacktrace,
          additional_properties: struct
        )
      end

      # Serialize an instance of ExceptionInfo to a JSON object
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
        obj.exception_type.is_a?(String) != false || raise("Passed value for field obj.exception_type is not the expected type, validation failed.")
        obj.exception_message.is_a?(String) != false || raise("Passed value for field obj.exception_message is not the expected type, validation failed.")
        obj.exception_stacktrace.is_a?(String) != false || raise("Passed value for field obj.exception_stacktrace is not the expected type, validation failed.")
      end
    end
  end
end
