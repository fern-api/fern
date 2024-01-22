# frozen_string_literal: true

require_relative "v_2/v_3/problem/types/TestCaseImplementationDescriptionBoard"
require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class TestCaseImplementationDescription
          attr_reader :boards, :additional_properties

          # @param boards [Array<V2::V3::Problem::TestCaseImplementationDescriptionBoard>]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::TestCaseImplementationDescription]
          def initialze(boards:, additional_properties: nil)
            # @type [Array<V2::V3::Problem::TestCaseImplementationDescriptionBoard>]
            @boards = boards
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of TestCaseImplementationDescription
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::TestCaseImplementationDescription]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            boards = struct.boards.map do |v|
              V2::V3::Problem::TestCaseImplementationDescriptionBoard.from_json(json_object: v)
            end
            new(boards: boards, additional_properties: struct)
          end

          # Serialize an instance of TestCaseImplementationDescription to a JSON object
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
  end
end
