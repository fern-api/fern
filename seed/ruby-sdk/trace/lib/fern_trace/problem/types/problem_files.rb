# frozen_string_literal: true

require_relative "../../commons/types/file_info"
require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class ProblemFiles
      # @return [FileInfo]
      attr_reader :solution_file
      # @return [Array<FileInfo>]
      attr_reader :read_only_files
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param solution_file [FileInfo]
      # @param read_only_files [Array<FileInfo>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [ProblemFiles]
      def initialize(solution_file:, read_only_files:, additional_properties: nil)
        @solution_file = solution_file
        @read_only_files = read_only_files
        @additional_properties = additional_properties
        @_field_set = { "solutionFile": solution_file, "readOnlyFiles": read_only_files }
      end

      # Deserialize a JSON object to an instance of ProblemFiles
      #
      # @param json_object [String]
      # @return [ProblemFiles]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["solutionFile"].nil?
          solution_file = nil
        else
          solution_file = parsed_json["solutionFile"].to_json
          solution_file = FileInfo.from_json(json_object: solution_file)
        end
        read_only_files = parsed_json["readOnlyFiles"]&.map do |v|
          v = v.to_json
          FileInfo.from_json(json_object: v)
        end
        new(
          solution_file: solution_file,
          read_only_files: read_only_files,
          additional_properties: struct
        )
      end

      # Serialize an instance of ProblemFiles to a JSON object
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
        FileInfo.validate_raw(obj: obj.solution_file)
        obj.read_only_files.is_a?(Array) != false || raise("Passed value for field obj.read_only_files is not the expected type, validation failed.")
      end
    end
  end
end
