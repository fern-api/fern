# frozen_string_literal: true

require_relative "file/types/File"
require_relative "file/directory/types/Directory"
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
        def initialze(name:, files: nil, directories: nil, additional_properties: nil)
          # @type [String]
          @name = name
          # @type [Array<File::File>]
          @files = files
          # @type [Array<File::Directory::Directory>]
          @directories = directories
          # @type [OpenStruct]
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
            File::File.from_json(json_object: v)
          end
          directories = struct.directories.map do |v|
            File::Directory::Directory.from_json(json_object: v)
          end
          new(name: name, files: files, directories: directories, additional_properties: struct)
        end

        # Serialize an instance of Directory to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            name: @name,
            files: @files,
            directories: @directories
          }.to_json
        end
      end
    end
  end
end
