# frozen_string_literal: true

require_relative "test_case_template"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetGeneratedTestCaseTemplateFileRequest
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseTemplate]
          attr_reader :template
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param template [SeedTraceClient::V2::V3::Problem::TestCaseTemplate]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::GetGeneratedTestCaseTemplateFileRequest]
          def initialize(template:, additional_properties: nil)
            @template = template
            @additional_properties = additional_properties
            @_field_set = { "template": template }
          end

          # Deserialize a JSON object to an instance of
          #  GetGeneratedTestCaseTemplateFileRequest
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::GetGeneratedTestCaseTemplateFileRequest]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["template"].nil?
              template = nil
            else
              template = parsed_json["template"].to_json
              template = SeedTraceClient::V2::V3::Problem::TestCaseTemplate.from_json(json_object: template)
            end
            new(template: template, additional_properties: struct)
          end

          # Serialize an instance of GetGeneratedTestCaseTemplateFileRequest to a JSON
          #  object
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
            SeedTraceClient::V2::V3::Problem::TestCaseTemplate.validate_raw(obj: obj.template)
          end
        end
      end
    end
  end
end
