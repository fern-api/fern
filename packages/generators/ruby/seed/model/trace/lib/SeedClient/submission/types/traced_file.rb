# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class TracedFile
      attr_reader :filename, :directory, :additional_properties

      # @param filename [String]
      # @param directory [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::TracedFile]
      def initialze(filename:, directory:, additional_properties: nil)
        # @type [String]
        @filename = filename
        # @type [String]
        @directory = directory
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of TracedFile
      #
      # @param json_object [JSON]
      # @return [Submission::TracedFile]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        filename = struct.filename
        directory = struct.directory
        new(filename: filename, directory: directory, additional_properties: struct)
      end

      # Serialize an instance of TracedFile to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { filename: @filename, directory: @directory }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.filename.is_a?(String) != false || raise("Passed value for field obj.filename is not the expected type, validation failed.")
        obj.directory.is_a?(String) != false || raise("Passed value for field obj.directory is not the expected type, validation failed.")
      end
    end
  end
end
