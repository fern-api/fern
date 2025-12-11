# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketBearerAuthClient
  class RealtimeNoAuth
    class NoAuthReceiveEvent
      # @return [String]
      attr_reader :response
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param response [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketBearerAuthClient::RealtimeNoAuth::NoAuthReceiveEvent]
      def initialize(response:, additional_properties: nil)
        @response = response
        @additional_properties = additional_properties
        @_field_set = { "response": response }
      end

      # Deserialize a JSON object to an instance of NoAuthReceiveEvent
      #
      # @param json_object [String]
      # @return [SeedWebsocketBearerAuthClient::RealtimeNoAuth::NoAuthReceiveEvent]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        response = parsed_json["response"]
        new(response: response, additional_properties: struct)
      end

      # Serialize an instance of NoAuthReceiveEvent to a JSON object
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
        obj.response.is_a?(String) != false || raise("Passed value for field obj.response is not the expected type, validation failed.")
      end
    end
  end
end
