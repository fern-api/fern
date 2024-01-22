# frozen_string_literal: true

require "json"

module SeedClient
  module Commons
    class FileInfo
      attr_reader :filename, :contents, :additional_properties

      # @param filename [String]
      # @param contents [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Commons::FileInfo]
      def initialze(filename:, contents:, additional_properties: nil)
        # @type [String]
        @filename = filename
        # @type [String]
        @contents = contents
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of FileInfo
      #
      # @param json_object [JSON]
      # @return [Commons::FileInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        filename = struct.filename
        contents = struct.contents
        new(filename: filename, contents: contents, additional_properties: struct)
      end

      # Serialize an instance of FileInfo to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "filename": @filename, "contents": @contents }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.filename.is_a?(String) != false || raise("Passed value for field obj.filename is not the expected type, validation failed.")
        obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
      end
    end
  end
end
