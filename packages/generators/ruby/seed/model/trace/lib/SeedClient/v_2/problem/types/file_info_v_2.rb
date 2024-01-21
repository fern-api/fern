# frozen_string_literal: true
require "json"

module SeedClient
  module V2
    module Problem
      class FileInfoV2
        attr_reader :filename, :directory, :contents, :editable, :additional_properties
        # @param filename [String] 
        # @param directory [String] 
        # @param contents [String] 
        # @param editable [Boolean] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::FileInfoV2] 
        def initialze(filename:, directory:, contents:, editable:, additional_properties: nil)
          # @type [String] 
          @filename = filename
          # @type [String] 
          @directory = directory
          # @type [String] 
          @contents = contents
          # @type [Boolean] 
          @editable = editable
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of FileInfoV2
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::FileInfoV2] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          filename = struct.filename
          directory = struct.directory
          contents = struct.contents
          editable = struct.editable
          new(filename: filename, directory: directory, contents: contents, editable: editable, additional_properties: struct)
        end
        # Serialize an instance of FileInfoV2 to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 filename: @filename,
 directory: @directory,
 contents: @contents,
 editable: @editable
}.to_json()
        end
      end
    end
  end
end