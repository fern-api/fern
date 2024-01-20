# frozen_string_literal: true

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
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of Parameter
        #
        # @param json_object [JSON]
        # @return [V2::Problem::Parameter]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parameter_id = V2::Problem::ParameterId.from_json(json_object: struct.parameterId)
          name = struct.name
          variable_type = Commons::VariableType.from_json(json_object: struct.variableType)
          new(parameter_id: parameter_id, name: name, variable_type: variable_type, additional_properties: struct)
        end

        # Serialize an instance of Parameter to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            parameterId: @parameter_id,
            name: @name,
            variableType: @variable_type
          }.to_json
        end
      end
    end
  end
end
