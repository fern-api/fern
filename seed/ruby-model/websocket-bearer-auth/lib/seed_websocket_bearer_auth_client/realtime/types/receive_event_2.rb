# frozen_string_literal: true

require "ostruct"
require "json"

module SeedWebsocketBearerAuthClient
  class Realtime
    class ReceiveEvent2
      # @return [String]
      attr_reader :gamma
      # @return [Integer]
      attr_reader :delta
      # @return [Boolean]
      attr_reader :epsilon
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param gamma [String]
      # @param delta [Integer]
      # @param epsilon [Boolean]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedWebsocketBearerAuthClient::Realtime::ReceiveEvent2]
      def initialize(gamma:, delta:, epsilon:, additional_properties: nil)
        @gamma = gamma
        @delta = delta
        @epsilon = epsilon
        @additional_properties = additional_properties
        @_field_set = { "gamma": gamma, "delta": delta, "epsilon": epsilon }
      end

      # Deserialize a JSON object to an instance of ReceiveEvent2
      #
      # @param json_object [String]
      # @return [SeedWebsocketBearerAuthClient::Realtime::ReceiveEvent2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        gamma = parsed_json["gamma"]
        delta = parsed_json["delta"]
        epsilon = parsed_json["epsilon"]
        new(
          gamma: gamma,
          delta: delta,
          epsilon: epsilon,
          additional_properties: struct
        )
      end

      # Serialize an instance of ReceiveEvent2 to a JSON object
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
        obj.gamma.is_a?(String) != false || raise("Passed value for field obj.gamma is not the expected type, validation failed.")
        obj.delta.is_a?(Integer) != false || raise("Passed value for field obj.delta is not the expected type, validation failed.")
        obj.epsilon.is_a?(Boolean) != false || raise("Passed value for field obj.epsilon is not the expected type, validation failed.")
      end
    end
  end
end
