# frozen_string_literal: true

require_relative "file"
require "ostruct"
require "json"

module SeedExamplesClient
  class Types
    class Directory
      # @return [String]
      attr_reader :name
      # @return [Array<SeedExamplesClient::Types::File>]
      attr_reader :files
      # @return [Array<SeedExamplesClient::Types::Directory>]
      attr_reader :directories
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param name [String]
      # @param files [Array<SeedExamplesClient::Types::File>]
      # @param directories [Array<SeedExamplesClient::Types::Directory>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedExamplesClient::Types::Directory]
      def initialize(name:, files: OMIT, directories: OMIT, additional_properties: nil)
        @name = name
        @files = files if files != OMIT
        @directories = directories if directories != OMIT
        @additional_properties = additional_properties
        @_field_set = { "name": name, "files": files, "directories": directories }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Directory
      #
      # @param json_object [String]
      # @return [SeedExamplesClient::Types::Directory]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        name = parsed_json["name"]
        files = parsed_json["files"]&.map do |item|
          item = item.to_json
          SeedExamplesClient::Types::File.from_json(json_object: item)
        end
        directories = parsed_json["directories"]&.map do |item|
          item = item.to_json
          SeedExamplesClient::Types::Directory.from_json(json_object: item)
        end
        new(
          name: name,
          files: files,
          directories: directories,
          additional_properties: struct
        )
      end

      # Serialize an instance of Directory to a JSON object
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
        obj.files&.is_a?(Array) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
        obj.directories&.is_a?(Array) != false || raise("Passed value for field obj.directories is not the expected type, validation failed.")
      end
    end
  end
end
