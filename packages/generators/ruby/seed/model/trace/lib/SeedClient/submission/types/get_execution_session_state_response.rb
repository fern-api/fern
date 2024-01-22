# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class GetExecutionSessionStateResponse
      attr_reader :states, :num_warming_instances, :warming_session_ids, :additional_properties

      # @param states [Hash{String => String}]
      # @param num_warming_instances [Integer]
      # @param warming_session_ids [Array<String>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::GetExecutionSessionStateResponse]
      def initialze(states:, warming_session_ids:, num_warming_instances: nil, additional_properties: nil)
        # @type [Hash{String => String}]
        @states = states
        # @type [Integer]
        @num_warming_instances = num_warming_instances
        # @type [Array<String>]
        @warming_session_ids = warming_session_ids
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GetExecutionSessionStateResponse
      #
      # @param json_object [JSON]
      # @return [Submission::GetExecutionSessionStateResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        states struct.states
        num_warming_instances struct.numWarmingInstances
        warming_session_ids struct.warmingSessionIds
        new(states: states, num_warming_instances: num_warming_instances, warming_session_ids: warming_session_ids,
            additional_properties: struct)
      end

      # Serialize an instance of GetExecutionSessionStateResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { states: @states, numWarmingInstances: @num_warming_instances,
          warmingSessionIds: @warming_session_ids }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.states.is_a?(Hash) != false || raise("Passed value for field obj.states is not the expected type, validation failed.")
        obj.num_warming_instances&.is_a?(Integer) != false || raise("Passed value for field obj.num_warming_instances is not the expected type, validation failed.")
        obj.warming_session_ids.is_a?(Array) != false || raise("Passed value for field obj.warming_session_ids is not the expected type, validation failed.")
      end
    end
  end
end
