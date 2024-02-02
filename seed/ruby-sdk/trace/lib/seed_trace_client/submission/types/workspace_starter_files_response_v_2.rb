# frozen_string_literal: true

require "json"

module SeedTraceClient
  module Submission
    class WorkspaceStarterFilesResponseV2
      attr_reader :files_by_language, :additional_properties

      # @param files_by_language [Hash{LANGUAGE => LANGUAGE}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceStarterFilesResponseV2]
      def initialize(files_by_language:, additional_properties: nil)
        # @type [Hash{LANGUAGE => LANGUAGE}]
        @files_by_language = files_by_language
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of WorkspaceStarterFilesResponseV2
      #
      # @param json_object [JSON]
      # @return [Submission::WorkspaceStarterFilesResponseV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        files_by_language = struct.filesByLanguage
        new(files_by_language: files_by_language, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceStarterFilesResponseV2 to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "filesByLanguage": @files_by_language }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.files_by_language.is_a?(Hash) != false || raise("Passed value for field obj.files_by_language is not the expected type, validation failed.")
      end
    end
  end
end
