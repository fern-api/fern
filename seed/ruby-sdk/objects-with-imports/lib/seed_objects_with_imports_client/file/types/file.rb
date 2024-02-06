# frozen_string_literal: true

require_relative "file_info"
require "json"

module SeedObjectsWithImportsClient
  class File
    class File
      attr_reader :name, :contents, :info, :additional_properties

      # @param name [String]
      # @param contents [String]
      # @param info [FILE_INFO]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [File::File]
      def initialize(name:, contents:, info:, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [String]
        @contents = contents
        # @type [FILE_INFO]
        @info = info
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of File
      #
      # @param json_object [JSON]
      # @return [File::File]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        contents = struct.contents
        info = File::FILE_INFO.key(struct.info) || struct.info
        new(name: name, contents: contents, info: info, additional_properties: struct)
      end

      # Serialize an instance of File to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "contents": @contents, "info": File::FILE_INFO[@info] || @info }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
        obj.info.is_a?(File::FILE_INFO) != false || raise("Passed value for field obj.info is not the expected type, validation failed.")
      end
    end
  end
end
