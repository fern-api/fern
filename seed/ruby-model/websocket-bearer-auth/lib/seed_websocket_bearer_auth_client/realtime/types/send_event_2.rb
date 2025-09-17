# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketBearerAuthClient
  class Realtime
    class SendEvent2
      # @return [String]
      attr_reader :send_text_2
      # @return [Boolean]
      attr_reader :send_param_2
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param send_text_2 [String]
      # @param send_param_2 [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketBearerAuthClient::Realtime::SendEvent2]
      def initialize(send_text_2:, send_param_2:, additional_properties: nil)
        @send_text_2 = send_text_2
        @send_param_2 = send_param_2
        @additional_properties = additional_properties
        @_field_set = { "sendText2": send_text_2, "sendParam2": send_param_2 }
      end

      # Deserialize a JSON object to an instance of SendEvent2
      #
      # @param json_object [String]
      # @return [SeedWebsocketBearerAuthClient::Realtime::SendEvent2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        send_text_2 = parsed_json["sendText2"]
        send_param_2 = parsed_json["sendParam2"]
        new(
          send_text_2: send_text_2,
          send_param_2: send_param_2,
          additional_properties: struct
        )
      end

      # Serialize an instance of SendEvent2 to a JSON object
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
        obj.send_text_2.is_a?(String) != false || raise("Passed value for field obj.send_text_2 is not the expected type, validation failed.")
        obj.send_param_2.is_a?(Boolean) != false || raise("Passed value for field obj.send_param_2 is not the expected type, validation failed.")
      end
    end
  end
end
