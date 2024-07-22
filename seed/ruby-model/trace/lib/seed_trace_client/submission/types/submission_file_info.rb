# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class SubmissionFileInfo
      # @return [String]
      attr_reader :directory
      # @return [String]
      attr_reader :filename
      # @return [String]
      attr_reader :contents
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param directory [String]
      # @param filename [String]
      # @param contents [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::SubmissionFileInfo]
      def initialize(directory:, filename:, contents:, additional_properties: nil)
        @directory = directory
        @filename = filename
        @contents = contents
        @additional_properties = additional_properties
        @_field_set = { "directory": directory, "filename": filename, "contents": contents }
      end

      # Deserialize a JSON object to an instance of SubmissionFileInfo
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::SubmissionFileInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        directory = parsed_json["directory"]
        filename = parsed_json["filename"]
        contents = parsed_json["contents"]
        new(
          directory: directory,
          filename: filename,
          contents: contents,
          additional_properties: struct
        )
      end

      # Serialize an instance of SubmissionFileInfo to a JSON object
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
        obj.directory.is_a?(String) != false || raise("Passed value for field obj.directory is not the expected type, validation failed.")
        obj.filename.is_a?(String) != false || raise("Passed value for field obj.filename is not the expected type, validation failed.")
        obj.contents.is_a?(String) != false || raise("Passed value for field obj.contents is not the expected type, validation failed.")
      end
    end
  end
end
