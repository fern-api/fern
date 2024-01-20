# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class TestCaseExpects
        attr_reader :expected_stdout, :additional_properties
        # @param expected_stdout [String] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::TestCaseExpects] 
        def initialze(expected_stdout: nil, additional_properties: nil)
          # @type [String] 
          @expected_stdout = expected_stdout
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of TestCaseExpects
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::TestCaseExpects] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          expected_stdout = struct.expectedStdout
          new(expected_stdout: expected_stdout, additional_properties: struct)
        end
        # Serialize an instance of TestCaseExpects to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 expectedStdout: @expected_stdout
}.to_json()
        end
      end
    end
  end
end