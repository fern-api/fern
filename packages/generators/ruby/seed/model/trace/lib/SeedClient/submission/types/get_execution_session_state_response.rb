# frozen_string_literal: true

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
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of GetExecutionSessionStateResponse
      #
      # @param json_object [JSON]
      # @return [Submission::GetExecutionSessionStateResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        states = struct.states
        num_warming_instances = struct.numWarmingInstances
        warming_session_ids = struct.warmingSessionIds
        new(states: states, num_warming_instances: num_warming_instances, warming_session_ids: warming_session_ids,
            additional_properties: struct)
      end

      # Serialize an instance of GetExecutionSessionStateResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          states: @states,
          numWarmingInstances: @num_warming_instances,
          warmingSessionIds: @warming_session_ids
        }.to_json
      end
    end
  end
end
