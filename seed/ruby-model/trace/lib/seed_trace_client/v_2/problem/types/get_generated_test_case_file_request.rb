# frozen_string_literal: true

require_relative "test_case_template"
require_relative "test_case_v_2"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class GetGeneratedTestCaseFileRequest
        attr_reader :template, :test_case, :additional_properties

        # @param template [V2::Problem::TestCaseTemplate]
        # @param test_case [V2::Problem::TestCaseV2]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::GetGeneratedTestCaseFileRequest]
        def initialize(test_case:, template: nil, additional_properties: nil)
          # @type [V2::Problem::TestCaseTemplate]
          @template = template
          # @type [V2::Problem::TestCaseV2]
          @test_case = test_case
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of GetGeneratedTestCaseFileRequest
        #
        # @param json_object [JSON]
        # @return [V2::Problem::GetGeneratedTestCaseFileRequest]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          if parsed_json["template"].nil?
            template = nil
          else
            template = parsed_json["template"].to_json
            template = V2::Problem::TestCaseTemplate.from_json(json_object: template)
          end
          if parsed_json["testCase"].nil?
            test_case = nil
          else
            test_case = parsed_json["testCase"].to_json
            test_case = V2::Problem::TestCaseV2.from_json(json_object: test_case)
          end
          new(template: template, test_case: test_case, additional_properties: struct)
        end

        # Serialize an instance of GetGeneratedTestCaseFileRequest to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "template": @template, "testCase": @test_case }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.template.nil? || V2::Problem::TestCaseTemplate.validate_raw(obj: obj.template)
          V2::Problem::TestCaseV2.validate_raw(obj: obj.test_case)
        end
      end
    end
  end
end
