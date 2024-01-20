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
        # @type [OpenStruct]
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
        {
          name: @name,
          actorOrActressId: @actor_or_actress_id
        }.to_json
      end
    end
  end
end
