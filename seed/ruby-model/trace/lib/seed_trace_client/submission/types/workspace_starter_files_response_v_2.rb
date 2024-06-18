# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class WorkspaceStarterFilesResponseV2
      # @return [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::V2::Problem::Files}]
      attr_reader :files_by_language
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param files_by_language [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::V2::Problem::Files}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::WorkspaceStarterFilesResponseV2]
      def initialize(files_by_language:, additional_properties: nil)
        @files_by_language = files_by_language
        @additional_properties = additional_properties
        @_field_set = { "filesByLanguage": files_by_language }
      end

      # Deserialize a JSON object to an instance of WorkspaceStarterFilesResponseV2
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::WorkspaceStarterFilesResponseV2]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        files_by_language = parsed_json["filesByLanguage"]&.transform_values do |value|
          value = value.to_json
          SeedTraceClient::V2::Problem::Files.from_json(json_object: value)
        end
        new(files_by_language: files_by_language, additional_properties: struct)
      end

      # Serialize an instance of WorkspaceStarterFilesResponseV2 to a JSON object
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
        obj.files_by_language.is_a?(Hash) != false || raise("Passed value for field obj.files_by_language is not the expected type, validation failed.")
      end
    end
  end
end
