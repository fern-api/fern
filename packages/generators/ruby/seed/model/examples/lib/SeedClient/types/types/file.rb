# frozen_string_literal: true

module SeedClient
  module Types
    class File
      attr_reader :name, :contents, :additional_properties

      # @param name [String]
      # @param contents [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::File]
      def initialze(name:, contents:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [String]
        @contents = contents
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of File
      #
      # @param json_object [JSON]
      # @return [Types::File]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        contents = struct.contents
        new(name: name, contents: contents, additional_properties: struct)
      end

      # Serialize an instance of File to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          name: @name,
          contents: @contents
        }.to_json
      end
    end
  end
end
