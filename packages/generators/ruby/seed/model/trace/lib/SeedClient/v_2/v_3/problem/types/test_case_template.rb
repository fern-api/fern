# frozen_string_literal: true

require_relative "test_case_template_id"
require_relative "test_case_implementation"
require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class TestCaseTemplate
          attr_reader :template_id, :name, :implementation, :additional_properties

          # @param template_id [V2::V3::Problem::TEST_CASE_TEMPLATE_ID]
          # @param name [String]
          # @param implementation [V2::V3::Problem::TestCaseImplementation]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::TestCaseTemplate]
          def initialize(template_id:, name:, implementation:, additional_properties: nil)
            # @type [V2::V3::Problem::TEST_CASE_TEMPLATE_ID]
            @template_id = template_id
            # @type [String]
            @name = name
            # @type [V2::V3::Problem::TestCaseImplementation]
            @implementation = implementation
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of TestCaseTemplate
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::TestCaseTemplate]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            template_id = struct.templateId
            name = struct.name
            implementation = struct.implementation.to_h.to_json
            implementation = V2::V3::Problem::TestCaseImplementation.from_json(json_object: implementation)
            new(template_id: template_id, name: name, implementation: implementation, additional_properties: struct)
          end

          # Serialize an instance of TestCaseTemplate to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "templateId": @template_id, "name": @name, "implementation": @implementation }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.template_id.is_a?(String) != false || raise("Passed value for field obj.template_id is not the expected type, validation failed.")
            obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
            V2::V3::Problem::TestCaseImplementation.validate_raw(obj: obj.implementation)
          end
        end
      end
    end
  end
end
