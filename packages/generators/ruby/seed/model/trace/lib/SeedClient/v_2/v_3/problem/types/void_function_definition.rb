# frozen_string_literal: true

module SeedClient
  module V2
    module V3
      module Problem
        class VoidFunctionDefinition
          attr_reader :parameters, :code, :additional_properties
          # @param parameters [Array<V2::V3::Problem::Parameter>] 
          # @param code [V2::V3::Problem::FunctionImplementationForMultipleLanguages] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::VoidFunctionDefinition] 
          def initialze(parameters:, code:, additional_properties: nil)
            # @type [Array<V2::V3::Problem::Parameter>] 
            @parameters = parameters
            # @type [V2::V3::Problem::FunctionImplementationForMultipleLanguages] 
            @code = code
            # @type [OpenStruct] 
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of VoidFunctionDefinition
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::VoidFunctionDefinition] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parameters = struct.parameters.map() do | v |
 V2::V3::Problem::Parameter.from_json(json_object: v)
end
            code = V2::V3::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: struct.code)
            new(parameters: parameters, code: code, additional_properties: struct)
          end
          # Serialize an instance of VoidFunctionDefinition to a JSON object
          #
          # @return [JSON] 
          def to_json
            {
 parameters: @parameters,
 code: @code
}.to_json()
          end
        end
      end
    end
  end
end