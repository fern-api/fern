# frozen_string_literal: true

module SeedClient
  module Problem
    class ProblemDescription
      attr_reader :boards, :additional_properties
      # @param boards [Array<Problem::ProblemDescriptionBoard>] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Problem::ProblemDescription] 
      def initialze(boards:, additional_properties: nil)
        # @type [Array<Problem::ProblemDescriptionBoard>] 
        @boards = boards
        # @type [OpenStruct] 
        @additional_properties = additional_properties
      end
      # Deserialize a JSON object to an instance of ProblemDescription
      #
      # @param json_object [JSON] 
      # @return [Problem::ProblemDescription] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        boards = struct.boards.map() do | v |
 Problem::ProblemDescriptionBoard.from_json(json_object: v)
end
        new(boards: boards, additional_properties: struct)
      end
      # Serialize an instance of ProblemDescription to a JSON object
      #
      # @return [JSON] 
      def to_json
        {
 boards: @boards
}.to_json()
      end
    end
  end
end