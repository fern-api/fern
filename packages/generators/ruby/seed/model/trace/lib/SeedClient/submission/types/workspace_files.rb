# frozen_string_literal: true

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
        # @type [OpenStruct]
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
        {
          mainFile: @main_file,
          readOnlyFiles: @read_only_files
        }.to_json
      end
    end
  end
end
