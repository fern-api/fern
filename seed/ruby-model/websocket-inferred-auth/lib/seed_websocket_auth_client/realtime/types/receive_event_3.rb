# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketAuthClient
  class Realtime
    class ReceiveEvent3
      # @return [String]
      attr_reader :receive_text_3
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param receive_text_3 [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketAuthClient::Realtime::ReceiveEvent3]
      def initialize(receive_text_3:, additional_properties: nil)
        @receive_text_3 = receive_text_3
        @additional_properties = additional_properties
        @_field_set = { "receiveText3": receive_text_3 }
      end

      # Deserialize a JSON object to an instance of ReceiveEvent3
      #
      # @param json_object [String]
      # @return [SeedWebsocketAuthClient::Realtime::ReceiveEvent3]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        receive_text_3 = parsed_json["receiveText3"]
        new(receive_text_3: receive_text_3, additional_properties: struct)
      end

      # Serialize an instance of ReceiveEvent3 to a JSON object
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
        obj.receive_text_3.is_a?(String) != false || raise("Passed value for field obj.receive_text_3 is not the expected type, validation failed.")
      end
    end
  end
end
