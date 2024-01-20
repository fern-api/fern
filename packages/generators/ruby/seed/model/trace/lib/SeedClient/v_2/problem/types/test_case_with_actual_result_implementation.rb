# frozen_string_literal: true

module SeedClient
  module V2
    module Problem
      class TestCaseWithActualResultImplementation
        attr_reader :get_actual_result, :assert_correctness_check, :additional_properties

        # @param get_actual_result [V2::Problem::NonVoidFunctionDefinition]
        # @param assert_correctness_check [V2::Problem::AssertCorrectnessCheck]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::TestCaseWithActualResultImplementation]
        def initialze(get_actual_result:, assert_correctness_check:, additional_properties: nil)
          # @type [V2::Problem::NonVoidFunctionDefinition]
          @get_actual_result = get_actual_result
          # @type [V2::Problem::AssertCorrectnessCheck]
          @assert_correctness_check = assert_correctness_check
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of TestCaseWithActualResultImplementation
        #
        # @param json_object [JSON]
        # @return [V2::Problem::TestCaseWithActualResultImplementation]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          get_actual_result = V2::Problem::NonVoidFunctionDefinition.from_json(json_object: struct.getActualResult)
          assert_correctness_check = V2::Problem::AssertCorrectnessCheck.from_json(json_object: struct.assertCorrectnessCheck)
          new(get_actual_result: get_actual_result, assert_correctness_check: assert_correctness_check,
              additional_properties: struct)
        end

        # Serialize an instance of TestCaseWithActualResultImplementation to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            getActualResult: @get_actual_result,
            assertCorrectnessCheck: @assert_correctness_check
          }.to_json
        end
      end
    end
  end
end
