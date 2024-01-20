# frozen_string_literal: true

module SeedClient
  module Submission
    class WorkspaceStarterFilesResponseV2
      attr_reader :files_by_language, :additional_properties
      # @param files_by_language [Hash{Commons::Language => Commons::Language}] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceStarterFilesResponseV2] 
      def initialze(files_by_language:, additional_properties: nil)
        # @type [Hash{Commons::Language => Commons::Language}] 
        @files_by_language = files_by_language
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of WorkspaceStarterFilesResponseV2
      #
      # @param json_object [JSON] 
      # @return [Submission::WorkspaceStarterFilesResponseV2] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        files_by_language = struct.filesByLanguage.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
        new(files_by_language: files_by_language, additional_properties: struct)
      end
      # Serialize an instance of WorkspaceStarterFilesResponseV2 to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 filesByLanguage: @files_by_language.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend
}.to_json()
      end
    end
  end
end