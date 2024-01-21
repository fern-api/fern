# frozen_string_literal: true
require "v_2/problem/types/TestCaseTemplate"
require "v_2/problem/types/TestCaseV2"
require "json"

module SeedClient
  module V2
    module Problem
      class GetGeneratedTestCaseFileRequest
        attr_reader :template, :test_case, :additional_properties
        # @param template [V2::Problem::TestCaseTemplate] 
        # @param test_case [V2::Problem::TestCaseV2] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::GetGeneratedTestCaseFileRequest] 
        def initialze(template: nil, test_case:, additional_properties: nil)
          # @type [V2::Problem::TestCaseTemplate] 
          @template = template
          # @type [V2::Problem::TestCaseV2] 
          @test_case = test_case
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of GetGeneratedTestCaseFileRequest
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::GetGeneratedTestCaseFileRequest] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          template = V2::Problem::TestCaseTemplate.from_json(json_object: struct.template)
          test_case = V2::Problem::TestCaseV2.from_json(json_object: struct.testCase)
          new(template: template, test_case: test_case, additional_properties: struct)
        end
        # Serialize an instance of GetGeneratedTestCaseFileRequest to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 template: @template,
 testCase: @test_case
}.to_json()
        end
      end
    end
  end
end