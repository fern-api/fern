# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class TestCaseExpects
        # @return [String]
        attr_reader :expected_stdout
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param expected_stdout [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::TestCaseExpects]
        def initialize(expected_stdout: OMIT, additional_properties: nil)
          @expected_stdout = expected_stdout if expected_stdout != OMIT
          @additional_properties = additional_properties
          @_field_set = { "expectedStdout": expected_stdout }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of TestCaseExpects
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::TestCaseExpects]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          expected_stdout = parsed_json["expectedStdout"]
          new(expected_stdout: expected_stdout, additional_properties: struct)
        end

        # Serialize an instance of TestCaseExpects to a JSON object
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
          obj.expected_stdout&.is_a?(String) != false || raise("Passed value for field obj.expected_stdout is not the expected type, validation failed.")
        end
      end
    end
  end
end
