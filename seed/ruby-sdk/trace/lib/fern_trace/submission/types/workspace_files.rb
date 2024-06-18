# frozen_string_literal: true

require_relative "../../commons/types/file_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceFiles
      # @return [SeedTraceClient::Commons::FileInfo]
      attr_reader :main_file
      # @return [Array<SeedTraceClient::Commons::FileInfo>]
      attr_reader :read_only_files
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param main_file [SeedTraceClient::Commons::FileInfo]
      # @param read_only_files [Array<SeedTraceClient::Commons::FileInfo>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceFiles]
      def initialize(main_file:, read_only_files:, additional_properties: nil)
        @main_file = main_file
        @read_only_files = read_only_files
        @additional_properties = additional_properties
        @_field_set = { "mainFile": main_file, "readOnlyFiles": read_only_files }
      end

      # Deserialize a JSON object to an instance of WorkspaceFiles
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceFiles]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["mainFile"].nil?
          main_file = nil
        else
          main_file = parsed_json["mainFile"].to_json
          main_file = SeedTraceClient::Commons::FileInfo.from_json(json_object: main_file)
        end
        read_only_files = parsed_json["readOnlyFiles"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Commons::FileInfo.from_json(json_object: item)
        end
        new(
          main_file: main_file,
          read_only_files: read_only_files,
          additional_properties: struct
        )
      end

      # Serialize an instance of WorkspaceFiles to a JSON object
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
        SeedTraceClient::Commons::FileInfo.validate_raw(obj: obj.main_file)
        obj.read_only_files.is_a?(Array) != false || raise("Passed value for field obj.read_only_files is not the expected type, validation failed.")
      end
    end
  end
end
