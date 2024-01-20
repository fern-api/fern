# frozen_string_literal: true

require "json"

module SeedClient
  module Types
    class Actor
      attr_reader :name, :id, :additional_properties

      # @param name [String]
      # @param id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Actor]
      def initialze(name:, id:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [String]
        @id = id
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Actor
      #
      # @param json_object [JSON]
      # @return [Types::Actor]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        id = struct.id
        new(name: name, id: id, additional_properties: struct)
      end

      # Serialize an instance of Actor to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          name: @name,
          id: @id
        }.to_json
      end
    end
  end
end
