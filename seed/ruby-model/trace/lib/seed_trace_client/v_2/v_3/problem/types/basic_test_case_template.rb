# frozen_string_literal: true

require_relative "test_case_implementation_description"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class BasicTestCaseTemplate
          # @return [String]
          attr_reader :template_id
          # @return [String]
          attr_reader :name
          # @return [SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription]
          attr_reader :description
          # @return [String]
          attr_reader :expected_value_parameter_id
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param template_id [String]
          # @param name [String]
          # @param description [SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription]
          # @param expected_value_parameter_id [String]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::BasicTestCaseTemplate]
          def initialize(template_id:, name:, description:, expected_value_parameter_id:, additional_properties: nil)
            @template_id = template_id
            @name = name
            @description = description
            @expected_value_parameter_id = expected_value_parameter_id
            @additional_properties = additional_properties
            @_field_set = {
              "templateId": template_id,
              "name": name,
              "description": description,
              "expectedValueParameterId": expected_value_parameter_id
            }
          end

          # Deserialize a JSON object to an instance of BasicTestCaseTemplate
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::BasicTestCaseTemplate]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            template_id = parsed_json["templateId"]
            name = parsed_json["name"]
            if parsed_json["description"].nil?
              description = nil
            else
              description = parsed_json["description"].to_json
              description = SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription.from_json(json_object: description)
            end
            expected_value_parameter_id = parsed_json["expectedValueParameterId"]
            new(
              template_id: template_id,
              name: name,
              description: description,
              expected_value_parameter_id: expected_value_parameter_id,
              additional_properties: struct
            )
          end

          # Serialize an instance of BasicTestCaseTemplate to a JSON object
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
            SeedTraceClient::V2::V3::Problem::TestCaseImplementationDescription.validate_raw(obj: obj.description)
            obj.expected_value_parameter_id.is_a?(String) != false || raise("Passed value for field obj.expected_value_parameter_id is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
