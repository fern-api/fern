# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketBearerAuthClient
  class Realtime
    class ReceiveSnakeCase
      # @return [String]
      attr_reader :receive_text
      # @return [Integer]
      attr_reader :receive_int
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param receive_text [String]
      # @param receive_int [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketBearerAuthClient::Realtime::ReceiveSnakeCase]
      def initialize(receive_text:, receive_int:, additional_properties: nil)
        @receive_text = receive_text
        @receive_int = receive_int
        @additional_properties = additional_properties
        @_field_set = { "receive_text": receive_text, "receive_int": receive_int }
      end

      # Deserialize a JSON object to an instance of ReceiveSnakeCase
      #
      # @param json_object [String]
      # @return [SeedWebsocketBearerAuthClient::Realtime::ReceiveSnakeCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        receive_text = parsed_json["receive_text"]
        receive_int = parsed_json["receive_int"]
        new(
          receive_text: receive_text,
          receive_int: receive_int,
          additional_properties: struct
        )
      end

      # Serialize an instance of ReceiveSnakeCase to a JSON object
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
        obj.receive_text.is_a?(String) != false || raise("Passed value for field obj.receive_text is not the expected type, validation failed.")
        obj.receive_int.is_a?(Integer) != false || raise("Passed value for field obj.receive_int is not the expected type, validation failed.")
      end
    end
  end
end
