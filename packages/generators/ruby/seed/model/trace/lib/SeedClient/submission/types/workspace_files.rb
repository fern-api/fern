# frozen_string_literal: true

require_relative "commons/types/FileInfo"
require "json"

module SeedClient
  module Submission
    class WorkspaceFiles
      attr_reader :main_file, :read_only_files, :additional_properties

      # @param main_file [Commons::FileInfo]
      # @param read_only_files [Array<Commons::FileInfo>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceFiles]
      def initialze(main_file:, read_only_files:, additional_properties: nil)
        # @type [Commons::FileInfo]
        @main_file = main_file
        # @type [Array<Commons::FileInfo>]
        @read_only_files = read_only_files
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceFiles
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceFiles]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        main_file = Commons::FileInfo.from_json(json_object: struct.mainFile)
        read_only_files = struct.readOnlyFiles.map do |v|
          Commons::FileInfo.from_json(json_object: v)
        end
        new(main_file: main_file, read_only_files: read_only_files, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceFiles to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "mainFile": @main_file, "readOnlyFiles": @read_only_files }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        Commons::FileInfo.validate_raw(obj: obj.main_file)
        obj.read_only_files.is_a?(Array) != false || raise("Passed value for field obj.read_only_files is not the expected type, validation failed.")
      end
    end
  end
end
