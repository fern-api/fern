# frozen_string_literal: true

require_relative "parameter_id"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class DeepEqualityCorrectnessCheck
          attr_reader :expected_value_parameter_id, :additional_properties, :_field_set
          protected :_field_set
          OMIT = Object.new
          # @param expected_value_parameter_id [SeedTraceClient::V2::V3::Problem::PARAMETER_ID]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::DeepEqualityCorrectnessCheck]
          def initialize(expected_value_parameter_id:, additional_properties: nil)
            # @type [SeedTraceClient::V2::V3::Problem::PARAMETER_ID]
            @expected_value_parameter_id = expected_value_parameter_id
            @_field_set = { "expectedValueParameterId": @expected_value_parameter_id }.reject do |_k, v|
              v == OMIT
            end
          end

          # Deserialize a JSON object to an instance of DeepEqualityCorrectnessCheck
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::DeepEqualityCorrectnessCheck]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            expected_value_parameter_id = struct["expectedValueParameterId"]
            new(expected_value_parameter_id: expected_value_parameter_id, additional_properties: struct)
          end

          # Serialize an instance of DeepEqualityCorrectnessCheck to a JSON object
          #
          # @return [String]
          def to_json(*_args)
            @_field_set&.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.expected_value_parameter_id.is_a?(String) != false || raise("Passed value for field obj.expected_value_parameter_id is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
