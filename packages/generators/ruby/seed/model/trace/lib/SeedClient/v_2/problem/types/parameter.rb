# frozen_string_literal: true

require_relative "v_2/problem/types/ParameterId"
require_relative "commons/types/VariableType"
require "json"

module SeedClient
  module V2
    module Problem
      class Parameter
        attr_reader :parameter_id, :name, :variable_type, :additional_properties

        # @param parameter_id [V2::Problem::ParameterId]
        # @param name [String]
        # @param variable_type [Commons::VariableType]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::Parameter]
        def initialze(parameter_id:, name:, variable_type:, additional_properties: nil)
          # @type [V2::Problem::ParameterId]
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
        # @return [V2::Problem::Parameter]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parameter_id V2::Problem::ParameterId.from_json(json_object: struct.parameterId)
          name struct.name
          variable_type Commons::VariableType.from_json(json_object: struct.variableType)
          new(parameter_id: parameter_id, name: name, variable_type: variable_type, additional_properties: struct)
        end

        # Serialize an instance of Parameter to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { parameterId: @parameter_id, name: @name, variableType: @variable_type }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          ParameterId.validate_raw(obj: obj.parameter_id)
          obj.name.is_a?(String) != false || raise("Passed value for field obj.name is not the expected type, validation failed.")
          VariableType.validate_raw(obj: obj.variable_type)
        end
      end
    end
  end
end
