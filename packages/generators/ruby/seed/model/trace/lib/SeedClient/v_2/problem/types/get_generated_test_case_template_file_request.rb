# frozen_string_literal: true

require_relative "v_2/problem/types/TestCaseTemplate"
require "json"

module SeedClient
  module V2
    module Problem
      class GetGeneratedTestCaseTemplateFileRequest
        attr_reader :template, :additional_properties

        # @param template [V2::Problem::TestCaseTemplate]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::GetGeneratedTestCaseTemplateFileRequest]
        def initialze(template:, additional_properties: nil)
          # @type [V2::Problem::TestCaseTemplate]
          @template = template
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of GetGeneratedTestCaseTemplateFileRequest
        #
        # @param json_object [JSON]
        # @return [V2::Problem::GetGeneratedTestCaseTemplateFileRequest]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          template = V2::Problem::TestCaseTemplate.from_json(json_object: struct.template)
          new(template: template, additional_properties: struct)
        end

        # Serialize an instance of GetGeneratedTestCaseTemplateFileRequest to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "template": @template }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          V2::Problem::TestCaseTemplate.validate_raw(obj: obj.template)
        end
      end
    end
  end
end
