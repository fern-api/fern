# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketClient
  class Realtime
    class SendSnakeCase
      # @return [String]
      attr_reader :send_text
      # @return [Integer]
      attr_reader :send_param
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param send_text [String]
      # @param send_param [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketClient::Realtime::SendSnakeCase]
      def initialize(send_text:, send_param:, additional_properties: nil)
        @send_text = send_text
        @send_param = send_param
        @additional_properties = additional_properties
        @_field_set = { "send_text": send_text, "send_param": send_param }
      end

      # Deserialize a JSON object to an instance of SendSnakeCase
      #
      # @param json_object [String]
      # @return [SeedWebsocketClient::Realtime::SendSnakeCase]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        send_text = parsed_json["send_text"]
        send_param = parsed_json["send_param"]
        new(
          send_text: send_text,
          send_param: send_param,
          additional_properties: struct
        )
      end

      # Serialize an instance of SendSnakeCase to a JSON object
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
        obj.send_text.is_a?(String) != false || raise("Passed value for field obj.send_text is not the expected type, validation failed.")
        obj.send_param.is_a?(Integer) != false || raise("Passed value for field obj.send_param is not the expected type, validation failed.")
      end
    end
  end
end
