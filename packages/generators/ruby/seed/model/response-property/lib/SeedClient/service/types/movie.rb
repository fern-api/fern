# frozen_string_literal: true

require "json"

module SeedClient
  module Service
    class Movie
      attr_reader :id, :name, :additional_properties

      # @param id [String]
      # @param name [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Service::Movie]
      def initialze(id:, name:, additional_properties: nil)
        # @type [String]
        @id = id
        # @type [String]
        @name = name
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Movie
      #
      # @param json_object [JSON]
      # @return [Service::Movie]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        id = struct.id
        name = struct.name
        new(id: id, name: name, additional_properties: struct)
      end

      # Serialize an instance of Movie to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          id: @id,
          name: @name
        }.to_json
      end
    end
  end
end
