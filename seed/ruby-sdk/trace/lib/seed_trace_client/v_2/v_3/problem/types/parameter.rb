# frozen_string_literal: true

require_relative "parameter_id"
require_relative "../../../../commons/types/variable_type"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class Parameter
          attr_reader :parameter_id, :name, :variable_type, :additional_properties

          # @param parameter_id [V2::V3::Problem::PARAMETER_ID]
          # @param name [String]
          # @param variable_type [Commons::VariableType]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::Parameter]
          def initialize(parameter_id:, name:, variable_type:, additional_properties: nil)
            # @type [V2::V3::Problem::PARAMETER_ID]
            @parameter_id = parameter_id
            # @type [String]
            @name = name
            # @type [Commons::VariableType]
            @variable_type = variable_type
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of Parameter
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::Parameter]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            parameter_id = struct.parameterId
            name = struct.name
            if parsed_json["variableType"].nil?
              variable_type = nil
            else
              variable_type = parsed_json["variableType"].to_json
              variable_type = Commons::VariableType.from_json(json_object: variable_type)
            end
            new(parameter_id: parameter_id, name: name, variable_type: variable_type, additional_properties: struct)
          end

          # Serialize an instance of Parameter to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "parameterId": @parameter_id, "name": @name, "variableType": @variable_type }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.parameter_id.is_a?(String) != false || raise("Passed value for field obj.parameter_id is not the expected type, validation failed.")
            obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
            Commons::VariableType.validate_raw(obj: obj.variable_type)
          end
        end
      end
    end
  end
end
