# frozen_string_literal: true
require "file/types/FileInfo"
require "json"

module SeedClient
  module File
    class File
      attr_reader :name, :contents, :info, :additional_properties
      # @param name [String] 
      # @param contents [String] 
      # @param info [File::FileInfo] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [File::File] 
      def initialze(name:, contents:, info:, additional_properties: nil)
        # @type [String] 
        @name = name
        # @type [String] 
        @contents = contents
        # @type [File::FileInfo] 
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
        name struct.name
        contents struct.contents
        info File::FileInfo.from_json(json_object: struct.info)
        new(name: name, contents: contents, info: info, additional_properties: struct)
      end
      # Serialize an instance of File to a JSON object
      #
      # @return [JSON] 
      def to_json
        { name: @name, contents: @contents, info: @info }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
        obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
        FileInfo.validate_raw(obj: obj.info)
      end
    end
  end
end