# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class SubmissionFileInfo
      attr_reader :directory, :filename, :contents, :additional_properties

      # @param directory [String]
      # @param filename [String]
      # @param contents [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::SubmissionFileInfo]
      def initialze(directory:, filename:, contents:, additional_properties: nil)
        # @type [String]
        @directory = directory
        # @type [String]
        @filename = filename
        # @type [String]
        @contents = contents
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of SubmissionFileInfo
      #
      # @param json_object [JSON]
      # @return [Submission::SubmissionFileInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        directory = struct.directory
        filename = struct.filename
        contents = struct.contents
        new(directory: directory, filename: filename, contents: contents, additional_properties: struct)
      end

      # Serialize an instance of SubmissionFileInfo to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "directory": @directory, "filename": @filename, "contents": @contents }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
