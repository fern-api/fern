# frozen_string_literal: true

require "json"

module SeedTraceClient
  class Submission
    class WorkspaceStarterFilesResponse
      attr_reader :files, :additional_properties

      # @param files [Hash{Commons::Language => Submission::WorkspaceFiles}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceStarterFilesResponse]
      def initialize(files:, additional_properties: nil)
        # @type [Hash{Commons::Language => Submission::WorkspaceFiles}]
        @files = files
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceStarterFilesResponse
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceStarterFilesResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        files = parsed_json["files"]&.transform_values do |_k, v|
          v = v.to_json
          Submission::WorkspaceFiles.from_json(json_object: v)
        end
        new(files: files, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceStarterFilesResponse to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "files": @files }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.files.is_a?(Hash) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
      end
    end
  end
end
