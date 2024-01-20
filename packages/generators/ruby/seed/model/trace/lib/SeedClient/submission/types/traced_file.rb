# frozen_string_literal: true

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
        # @type [OpenStruct]
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
        {
          filename: @filename,
          directory: @directory
        }.to_json
      end
    end
  end
end
