# frozen_string_literal: true

require_relative "test_case_template"
require_relative "test_case_v_2"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetGeneratedTestCaseFileRequest
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseTemplate]
          attr_reader :template
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseV2]
          attr_reader :test_case
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param template [SeedTraceClient::V2::V3::Problem::TestCaseTemplate]
          # @param test_case [SeedTraceClient::V2::V3::Problem::TestCaseV2]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::GetGeneratedTestCaseFileRequest]
          def initialize(test_case:, template: OMIT, additional_properties: nil)
            @template = template if template != OMIT
            @test_case = test_case
            @additional_properties = additional_properties
            @_field_set = { "template": template, "testCase": test_case }.reject do |_k, v|
              v == OMIT
            end
          end

          # Deserialize a JSON object to an instance of GetGeneratedTestCaseFileRequest
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::GetGeneratedTestCaseFileRequest]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["template"].nil?
              template = nil
            else
              template = parsed_json["template"].to_json
              template = SeedTraceClient::V2::V3::Problem::TestCaseTemplate.from_json(json_object: template)
            end
            if parsed_json["testCase"].nil?
              test_case = nil
            else
              test_case = parsed_json["testCase"].to_json
              test_case = SeedTraceClient::V2::V3::Problem::TestCaseV2.from_json(json_object: test_case)
            end
            new(
              template: template,
              test_case: test_case,
              additional_properties: struct
            )
          end

          # Serialize an instance of GetGeneratedTestCaseFileRequest to a JSON object
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
            obj.template.nil? || SeedTraceClient::V2::V3::Problem::TestCaseTemplate.validate_raw(obj: obj.template)
            SeedTraceClient::V2::V3::Problem::TestCaseV2.validate_raw(obj: obj.test_case)
          end
        end
      end
    end
  end
end
