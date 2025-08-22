# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketAuthClient
  class Realtime
    class ReceiveEvent
      # @return [String]
      attr_reader :alpha
      # @return [Integer]
      attr_reader :beta
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param alpha [String]
      # @param beta [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketAuthClient::Realtime::ReceiveEvent]
      def initialize(alpha:, beta:, additional_properties: nil)
        @alpha = alpha
        @beta = beta
        @additional_properties = additional_properties
        @_field_set = { "alpha": alpha, "beta": beta }
      end

      # Deserialize a JSON object to an instance of ReceiveEvent
      #
      # @param json_object [String]
      # @return [SeedWebsocketAuthClient::Realtime::ReceiveEvent]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        alpha = parsed_json["alpha"]
        beta = parsed_json["beta"]
        new(
          alpha: alpha,
          beta: beta,
          additional_properties: struct
        )
      end

      # Serialize an instance of ReceiveEvent to a JSON object
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
        obj.alpha.is_a?(String) != false || raise("Passed value for field obj.alpha is not the expected type, validation failed.")
        obj.beta.is_a?(Integer) != false || raise("Passed value for field obj.beta is not the expected type, validation failed.")
      end
    end
  end
end
