# frozen_string_literal: true

require "json"

module SeedClient
  module Types
    class Actress
      attr_reader :name, :id, :additional_properties

      # @param name [String]
      # @param id [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Actress]
      def initialze(name:, id:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [String]
        @id = id
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Actress
      #
      # @param json_object [JSON]
      # @return [Types::Actress]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        id = struct.id
        new(name: name, id: id, additional_properties: struct)
      end

      # Serialize an instance of Actress to a JSON object
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
