# frozen_string_literal: true

require_relative "commons/types/FileInfo"
require "json"

module SeedClient
  module Problem
    class ProblemFiles
      attr_reader :solution_file, :read_only_files, :additional_properties

      # @param solution_file [Commons::FileInfo]
      # @param read_only_files [Array<Commons::FileInfo>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::ProblemFiles]
      def initialze(solution_file:, read_only_files:, additional_properties: nil)
        # @type [Commons::FileInfo]
        @solution_file = solution_file
        # @type [Array<Commons::FileInfo>]
        @read_only_files = read_only_files
        # @type [OpenStruct]
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ProblemFiles
      #
      # @param json_object [JSON]
      # @return [Problem::ProblemFiles]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        solution_file = Commons::FileInfo.from_json(json_object: struct.solutionFile)
        read_only_files = struct.readOnlyFiles.map do |v|
          Commons::FileInfo.from_json(json_object: v)
        end
        new(solution_file: solution_file, read_only_files: read_only_files, additional_properties: struct)
      end

      # Serialize an instance of ProblemFiles to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          solutionFile: @solution_file,
          readOnlyFiles: @read_only_files
        }.to_json
      end
    end
  end
end
