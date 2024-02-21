# frozen_string_literal: true

require "json"

module SeedTraceClient
  class Submission
    class CompileError
      attr_reader :message, :additional_properties

      # @param message [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::CompileError]
      def initialize(message:, additional_properties: nil)
        # @type [String]
        @message = message
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of CompileError
      #
      # @param json_object [JSON]
      # @return [Submission::CompileError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        JSON.parse(json_object)
        message = struct.message
        new(message: message, additional_properties: struct)
      end

      # Serialize an instance of CompileError to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "message": @message }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.message.is_a?(String) != false || raise("Passed value for field obj.message is not the expected type, validation failed.")
      end
    end
  end
end
