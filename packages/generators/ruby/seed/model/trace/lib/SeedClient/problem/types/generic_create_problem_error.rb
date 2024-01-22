# frozen_string_literal: true

require "json"

module SeedClient
  module Problem
    class GenericCreateProblemError
      attr_reader :message, :type, :stacktrace, :additional_properties

      # @param message [String]
      # @param type [String]
      # @param stacktrace [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::GenericCreateProblemError]
      def initialze(message:, type:, stacktrace:, additional_properties: nil)
        # @type [String]
        @message = message
        # @type [String]
        @type = type
        # @type [String]
        @stacktrace = stacktrace
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GenericCreateProblemError
      #
      # @param json_object [JSON]
      # @return [Problem::GenericCreateProblemError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        message = struct.message
        type = struct.type
        stacktrace = struct.stacktrace
        new(message: message, type: type, stacktrace: stacktrace, additional_properties: struct)
      end

      # Serialize an instance of GenericCreateProblemError to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { message: @message, type: @type, stacktrace: @stacktrace }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
