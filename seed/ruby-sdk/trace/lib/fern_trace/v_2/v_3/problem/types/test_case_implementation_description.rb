# frozen_string_literal: true

require_relative "test_case_implementation_description_board"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class TestCaseImplementationDescription
          # @return [Array<SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescriptionBoard>]
          attr_reader :boards
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param boards [Array<SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescriptionBoard>]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription]
          def initialize(boards:, additional_properties: nil)
            @boards = boards
            @additional_properties = additional_properties
            @_field_set = { "boards": boards }
          end

          # Deserialize a JSON object to an instance of TestCaseImplementationDescription
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            boards = parsed_json["boards"]&.map do |item|
              item = item.to_json
              SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescriptionBoard.from_json(json_object: item)
            end
            new(boards: boards, additional_properties: struct)
          end

          # Serialize an instance of TestCaseImplementationDescription to a JSON object
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
  end
end
