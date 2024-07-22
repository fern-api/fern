# frozen_string_literal: true

require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class StuntDouble
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :actor_or_actress_id
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param actor_or_actress_id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::StuntDouble]
      def initialize(name:, actor_or_actress_id:, additional_properties: nil)
        @name = name
        @actor_or_actress_id = actor_or_actress_id
        @additional_properties = additional_properties
        @_field_set = { "name": name, "actorOrActressId": actor_or_actress_id }
      end

      # Deserialize a JSON object to an instance of StuntDouble
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::StuntDouble]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        actor_or_actress_id = parsed_json["actorOrActressId"]
        new(
          name: name,
          actor_or_actress_id: actor_or_actress_id,
          additional_properties: struct
        )
      end

      # Serialize an instance of StuntDouble to a JSON object
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
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.actor_or_actress_id.is_a?(String) != false || raise("Passed value for field obj.actor_or_actress_id is not the expected type, validation failed.")
      end
    end
  end
end
