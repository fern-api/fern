# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class GetDefaultStarterFilesResponse
      # @return [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles}]
      attr_reader :files
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param files [Hash{SeedTraceClient::Commons::Language => SeedTraceClient::Problem::ProblemFiles}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Problem::GetDefaultStarterFilesResponse]
      def initialize(files:, additional_properties: nil)
        @files = files
        @additional_properties = additional_properties
        @_field_set = { "files": files }
      end

      # Deserialize a JSON object to an instance of GetDefaultStarterFilesResponse
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::GetDefaultStarterFilesResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        files = parsed_json["files"]&.transform_values do |value|
          value = value.to_json
          SeedTraceClient::Problem::ProblemFiles.from_json(json_object: value)
        end
        new(files: files, additional_properties: struct)
      end

      # Serialize an instance of GetDefaultStarterFilesResponse to a JSON object
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
        obj.files.is_a?(Hash) != false || raise("Passed value for field obj.files is not the expected type, validation failed.")
      end
    end
  end
end
