# frozen_string_literal: true

require "json"

module SeedClient
  module Types
    class StuntDouble
      attr_reader :name, :actor_or_actress_id, :additional_properties

      # @param name [String]
      # @param actor_or_actress_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::StuntDouble]
      def initialze(name:, actor_or_actress_id:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [String]
        @actor_or_actress_id = actor_or_actress_id
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of StuntDouble
      #
      # @param json_object [JSON]
      # @return [Types::StuntDouble]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        actor_or_actress_id = struct.actorOrActressId
        new(name: name, actor_or_actress_id: actor_or_actress_id, additional_properties: struct)
      end

      # Serialize an instance of StuntDouble to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { name: @name, actorOrActressId: @actor_or_actress_id }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.actor_or_actress_id.is_a?(String) != false || raise("Passed value for field obj.actor_or_actress_id is not the expected type, validation failed.")
      end
    end
  end
end
