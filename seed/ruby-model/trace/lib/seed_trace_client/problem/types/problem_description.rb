# frozen_string_literal: true

require_relative "problem_description_board"
require "json"

module SeedTraceClient
  class Problem
    class ProblemDescription
      attr_reader :boards, :additional_properties

      # @param boards [Array<Problem::ProblemDescriptionBoard>]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::ProblemDescription]
      def initialize(boards:, additional_properties: nil)
        # @type [Array<Problem::ProblemDescriptionBoard>]
        @boards = boards
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of ProblemDescription
      #
      # @param json_object [JSON]
      # @return [Problem::ProblemDescription]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        boards = parsed_json["boards"]&.map do |v|
          v = v.to_json
          Problem::ProblemDescriptionBoard.from_json(json_object: v)
        end
        new(boards: boards, additional_properties: struct)
      end

      # Serialize an instance of ProblemDescription to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { "boards": @boards }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.boards.is_a?(Array) != false || raise("Passed value for field obj.boards is not the expected type, validation failed.")
      end
    end
  end
end
