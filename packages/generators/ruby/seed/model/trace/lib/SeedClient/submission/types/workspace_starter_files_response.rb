# frozen_string_literal: true

module SeedClient
  module Submission
    class WorkspaceStarterFilesResponse
      attr_reader :files, :additional_properties
      # @param files [Hash{Commons::Language => Commons::Language}] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::WorkspaceStarterFilesResponse] 
      def initialze(files:, additional_properties: nil)
        # @type [Hash{Commons::Language => Commons::Language}] 
        @files = files
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of WorkspaceStarterFilesResponse
      #
      # @param json_object [JSON] 
      # @return [Submission::WorkspaceStarterFilesResponse] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        files = struct.files.transform_values() do | v |
 Commons::Language.from_json(json_object: v)
end
        new(files: files, additional_properties: struct)
      end
      # Serialize an instance of WorkspaceStarterFilesResponse to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 files: @files.transform_values() do | v |\n Commons::Language.from_json(json_object: v)\nend
}.to_json()
      end
    end
  end
end