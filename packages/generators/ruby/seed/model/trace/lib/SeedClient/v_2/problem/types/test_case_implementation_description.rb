# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class TestCaseImplementationDescription
        attr_reader :boards, :additional_properties

        # @param boards [Array<V2::Problem::TestCaseImplementationDescriptionBoard>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::TestCaseImplementationDescription]
        def initialze(boards:, additional_properties: nil)
          # @type [Array<V2::Problem::TestCaseImplementationDescriptionBoard>]
          @boards = boards
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of TestCaseImplementationDescription
        #
        # @param json_object [JSON]
        # @return [V2::Problem::TestCaseImplementationDescription]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          boards = struct.boards.map do |v|
            V2::Problem::TestCaseImplementationDescriptionBoard.from_json(json_object: v)
          end
          new(boards: boards, additional_properties: struct)
        end

        # Serialize an instance of TestCaseImplementationDescription to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            boards: @boards
          }.to_json
        end
      end
    end
  end
end
