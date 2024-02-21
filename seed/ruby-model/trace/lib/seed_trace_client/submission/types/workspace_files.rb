# frozen_string_literal: true

require_relative "../../commons/types/file_info"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceFiles
      attr_reader :main_file, :read_only_files, :additional_properties

      # @param main_file [Commons::FileInfo]
      # @param read_only_files [Array<Commons::FileInfo>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceFiles]
      def initialize(main_file:, read_only_files:, additional_properties: nil)
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
        parsed_json = JSON.parse(json_object)
        if parsed_json["mainFile"].nil?
          main_file = nil
        else
          main_file = parsed_json["mainFile"].to_json
          main_file = Commons::FileInfo.from_json(json_object: main_file)
        end
        read_only_files = parsed_json["readOnlyFiles"]&.map do |v|
          v = v.to_json
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
