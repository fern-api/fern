# frozen_string_literal: true

module SeedClient
  module V2
    module V3
      module Problem
        class VoidFunctionSignatureThatTakesActualResult
          attr_reader :parameters, :actual_result_type, :additional_properties
          # @param parameters [Array<V2::V3::Problem::Parameter>] 
          # @param actual_result_type [Commons::VariableType] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::VoidFunctionSignatureThatTakesActualResult] 
          def initialze(parameters:, actual_result_type:, additional_properties: nil)
            # @type [Array<V2::V3::Problem::Parameter>] 
            @parameters = parameters
            # @type [Commons::VariableType] 
            @actual_result_type = actual_result_type
            # @type [OpenStruct] 
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of VoidFunctionSignatureThatTakesActualResult
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::VoidFunctionSignatureThatTakesActualResult] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parameters = struct.parameters.map() do | v |
 V2::V3::Problem::Parameter.from_json(json_object: v)
end
            actual_result_type = Commons::VariableType.from_json(json_object: struct.actualResultType)
            new(parameters: parameters, actual_result_type: actual_result_type, additional_properties: struct)
          end
          # Serialize an instance of VoidFunctionSignatureThatTakesActualResult to a JSON object
          #
          # @return [JSON] 
          def to_json
            {
 parameters: @parameters,
 actualResultType: @actual_result_type
}.to_json()
          end
        end
      end
    end
  end
end