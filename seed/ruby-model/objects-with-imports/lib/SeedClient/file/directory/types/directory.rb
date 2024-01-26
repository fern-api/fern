# frozen_string_literal: true

require_relative "../../types/file"
require "json"

module SeedClient
  module File
    module Directory
      class Directory
        attr_reader :name, :files, :directories, :additional_properties

        # @param name [String]
        # @param files [Array<File::File>]
        # @param directories [Array<File::Directory::Directory>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [File::Directory::Directory]
        def initialize(name:, files: nil, directories: nil, additional_properties: nil)
          # @type [String]
          @name = name
          # @type [Array<File::File>]
          @files = files
          # @type [Array<File::Directory::Directory>]
          @directories = directories
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Directory
        #
        # @param json_object [JSON]
        # @return [File::Directory::Directory]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          name = struct.name
          files = struct.files.map do |v|
            v = v.to_h.to_json
            File::File.from_json(json_object: v)
          end
          directories = struct.directories.map do |v|
            v = v.to_h.to_json
            File::Directory::Directory.from_json(json_object: v)
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
end
