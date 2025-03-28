# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Commons
    class FileInfo
      # @return [String]
      attr_reader :filename
      # @return [String]
      attr_reader :contents
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param filename [String]
      # @param contents [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Commons::FileInfo]
      def initialize(filename:, contents:, additional_properties: nil)
        @filename = filename
        @contents = contents
        @additional_properties = additional_properties
        @_field_set = { "filename": filename, "contents": contents }
      end

      # Deserialize a JSON object to an instance of FileInfo
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Commons::FileInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        filename = parsed_json["filename"]
        contents = parsed_json["contents"]
        new(
          filename: filename,
          contents: contents,
          additional_properties: struct
        )
      end

      # Serialize an instance of FileInfo to a JSON object
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
        obj.filename.is_a?(String) != false || raise("Passed value for field obj.filename is not the expected type, validation failed.")
        obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
      end
    end
  end
end
