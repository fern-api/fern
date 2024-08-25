# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class GenericCreateProblemError
      # @return [String]
      attr_reader :message
      # @return [String]
      attr_reader :type
      # @return [String]
      attr_reader :stacktrace
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param message [String]
      # @param type [String]
      # @param stacktrace [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Problem::GenericCreateProblemError]
      def initialize(message:, type:, stacktrace:, additional_properties: nil)
        @message = message
        @type = type
        @stacktrace = stacktrace
        @additional_properties = additional_properties
        @_field_set = { "message": message, "type": type, "stacktrace": stacktrace }
      end

      # Deserialize a JSON object to an instance of GenericCreateProblemError
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::GenericCreateProblemError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        message = parsed_json["message"]
        type = parsed_json["type"]
        stacktrace = parsed_json["stacktrace"]
        new(
          message: message,
          type: type,
          stacktrace: stacktrace,
          additional_properties: struct
        )
      end

      # Serialize an instance of GenericCreateProblemError to a JSON object
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
        obj.message.is_a?(String) != false || raise("Passed value for field obj.message is not the expected type, validation failed.")
        obj.type.is_a?(String) != false || raise("Passed value for field obj.type is not the expected type, validation failed.")
        obj.stacktrace.is_a?(String) != false || raise("Passed value for field obj.stacktrace is not the expected type, validation failed.")
      end
    end
  end
end
