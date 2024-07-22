# frozen_string_literal: true

require_relative "test_case_implementation"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class TestCaseTemplate
          # @return [String]
          attr_reader :template_id
          # @return [String]
          attr_reader :name
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementation]
          attr_reader :implementation
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param template_id [String]
          # @param name [String]
          # @param implementation [SeedTraceClient::V2::V3::Problem::TestCaseImplementation]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseTemplate]
          def initialize(template_id:, name:, implementation:, additional_properties: nil)
            @template_id = template_id
            @name = name
            @implementation = implementation
            @additional_properties = additional_properties
            @_field_set = { "templateId": template_id, "name": name, "implementation": implementation }
          end

          # Deserialize a JSON object to an instance of TestCaseTemplate
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseTemplate]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            template_id = parsed_json["templateId"]
            name = parsed_json["name"]
            if parsed_json["implementation"].nil?
              implementation = nil
            else
              implementation = parsed_json["implementation"].to_json
              implementation = SeedTraceClient::V2::V3::Problem::TestCaseImplementation.from_json(json_object: implementation)
            end
            new(
              template_id: template_id,
              name: name,
              implementation: implementation,
              additional_properties: struct
            )
          end

          # Serialize an instance of TestCaseTemplate to a JSON object
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
            obj.template_id.is_a?(String) != false || raise("Passed value for field obj.template_id is not the expected type, validation failed.")
            obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
            SeedTraceClient::V2::V3::Problem::TestCaseImplementation.validate_raw(obj: obj.implementation)
          end
        end
      end
    end
  end
end
