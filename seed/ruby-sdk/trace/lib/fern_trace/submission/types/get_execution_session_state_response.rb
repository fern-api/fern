# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class GetExecutionSessionStateResponse
      # @return [Hash{String => SeedTraceClient::Submission::ExecutionSessionState}]
      attr_reader :states
      # @return [Integer]
      attr_reader :num_warming_instances
      # @return [Array<String>]
      attr_reader :warming_session_ids
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param states [Hash{String => SeedTraceClient::Submission::ExecutionSessionState}]
      # @param num_warming_instances [Integer]
      # @param warming_session_ids [Array<String>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::GetExecutionSessionStateResponse]
      def initialize(states:, warming_session_ids:, num_warming_instances: OMIT, additional_properties: nil)
        @states = states
        @num_warming_instances = num_warming_instances if num_warming_instances != OMIT
        @warming_session_ids = warming_session_ids
        @additional_properties = additional_properties
        @_field_set = {
          "states": states,
          "numWarmingInstances": num_warming_instances,
          "warmingSessionIds": warming_session_ids
        }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of GetExecutionSessionStateResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::GetExecutionSessionStateResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        states = parsed_json["states"]&.transform_values do |value|
          value = value.to_json
          SeedTraceClient::Submission::ExecutionSessionState.from_json(json_object: value)
        end
        num_warming_instances = parsed_json["numWarmingInstances"]
        warming_session_ids = parsed_json["warmingSessionIds"]
        new(
          states: states,
          num_warming_instances: num_warming_instances,
          warming_session_ids: warming_session_ids,
          additional_properties: struct
        )
      end

      # Serialize an instance of GetExecutionSessionStateResponse to a JSON object
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
        obj.states.is_a?(Hash) != false || raise("Passed value for field obj.states is not the expected type, validation failed.")
        obj.num_warming_instances&.is_a?(Integer) != false || raise("Passed value for field obj.num_warming_instances is not the expected type, validation failed.")
        obj.warming_session_ids.is_a?(Array) != false || raise("Passed value for field obj.warming_session_ids is not the expected type, validation failed.")
      end
    end
  end
end
