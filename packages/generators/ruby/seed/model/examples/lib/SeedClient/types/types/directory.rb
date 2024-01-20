# frozen_string_literal: true

module SeedClient
  module Types
    class Directory
      attr_reader :name, :files, :directories, :additional_properties
      # @param name [String] 
      # @param files [Array<Types::File>] 
      # @param directories [Array<Types::Directory>] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Types::Directory] 
      def initialze(name:, files: nil, directories: nil, additional_properties: nil)
        # @type [String] 
        @name = name
        # @type [Array<Types::File>] 
        @files = files
        # @type [Array<Types::Directory>] 
        @directories = directories
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of Directory
      #
      # @param json_object [JSON] 
      # @return [Types::Directory] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        name = struct.name
        files = struct.files.map() do | v |
 Types::File.from_json(json_object: v)
end
        directories = struct.directories.map() do | v |
 Types::Directory.from_json(json_object: v)
end
        new(name: name, files: files, directories: directories, additional_properties: struct)
      end
      # Serialize an instance of Directory to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 name: @name,
 files: @files,
 directories: @directories
}.to_json()
      end
    end
  end
end