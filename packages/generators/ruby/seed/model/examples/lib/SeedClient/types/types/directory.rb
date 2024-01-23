# frozen_string_literal: true

require_relative "file"
require "json"

module SeedClient
  module Types
    class Directory
      attr_reader :name, :files, :directories, :additional_properties

      # @param name [String]
      # @param files [Array<Types::File>]
      # @param directories [Array<Types::Directory>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Directory]
      def initialize(name:, files: nil, directories: nil, additional_properties: nil)
        # @type [String]
        @name = name
        # @type [Array<Types::File>]
        @files = files
        # @type [Array<Types::Directory>]
        @directories = directories
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of Directory
      #
      # @param json_object [JSON]
      # @return [Types::Directory]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        files = struct.files.map do |v|
          v = v.to_h.to_json
          Types::File.from_json(json_object: v)
        end
        directories = struct.directories.map do |v|
          v = v.to_h.to_json
          Types::Directory.from_json(json_object: v)
        end
        new(name: name, files: files, directories: directories, additional_properties: struct)
      end

      # Serialize an instance of Directory to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "name": @name, "files": @files, "directories": @directories }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.files&.is_a?(Array) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
        obj.directories&.is_a?(Array) != false || raise("Passed value for field obj.directories is not the expected type, validation failed.")
      end
    end
  end
end
