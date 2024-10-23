# frozen_string_literal: true

require_relative "problem_description_board"
require "ostruct"
require "json"

module SeedTraceClient
  class Problem
    class ProblemDescription
      # @return [Array<SeedTraceClient::Problem::ProblemDescriptionBoard>]
      attr_reader :boards
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param boards [Array<SeedTraceClient::Problem::ProblemDescriptionBoard>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Problem::ProblemDescription]
      def initialize(boards:, additional_properties: nil)
        @boards = boards
        @additional_properties = additional_properties
        @_field_set = { "boards": boards }
      end

      # Deserialize a JSON object to an instance of ProblemDescription
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::ProblemDescription]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        boards = parsed_json["boards"]&.map do |item|
          item = item.to_json
          SeedTraceClient::Problem::ProblemDescriptionBoard.from_json(json_object: item)
        end
        new(boards: boards, additional_properties: struct)
      end

      # Serialize an instance of ProblemDescription to a JSON object
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
        obj.boards.is_a?(Array) != false || raise("Passed value for field obj.boards is not the expected type, validation failed.")
      end
    end
  end
end
