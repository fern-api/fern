# frozen_string_literal: true

require_relative "file_info"
require "ostruct"
require "json"

module SeedObjectsWithImportsClient
  class File
    class File
      # @return [String]
      attr_reader :name
      # @return [String]
      attr_reader :contents
      # @return [SeedObjectsWithImportsClient::File::FileInfo]
      attr_reader :info
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param contents [String]
      # @param info [SeedObjectsWithImportsClient::File::FileInfo]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedObjectsWithImportsClient::File::File]
      def initialize(name:, contents:, info:, additional_properties: nil)
        @name = name
        @contents = contents
        @info = info
        @additional_properties = additional_properties
        @_field_set = { "name": name, "contents": contents, "info": info }
      end

      # Deserialize a JSON object to an instance of File
      #
      # @param json_object [String]
      # @return [SeedObjectsWithImportsClient::File::File]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        contents = parsed_json["contents"]
        info = parsed_json["info"]
        new(
          name: name,
          contents: contents,
          info: info,
          additional_properties: struct
        )
      end

      # Serialize an instance of File to a JSON object
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
        obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
        obj.info.is_a?(SeedObjectsWithImportsClient::File::FileInfo) != false || raise("Passed value for field obj.info is not the expected type, validation failed.")
      end
    end
  end
end
