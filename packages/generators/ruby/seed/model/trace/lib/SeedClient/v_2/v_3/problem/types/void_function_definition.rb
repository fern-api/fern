# frozen_string_literal: true
require "v_2/v_3/problem/types/Parameter"
require "v_2/v_3/problem/types/FunctionImplementationForMultipleLanguages"
require "json"

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
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of VoidFunctionDefinition
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::VoidFunctionDefinition] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parameters struct.parameters.map() do | v |
  V2::V3::Problem::Parameter.from_json(json_object: v)
end
            code V2::V3::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: struct.code)
            new(parameters: parameters, code: code, additional_properties: struct)
          end
          # Serialize an instance of VoidFunctionDefinition to a JSON object
          #
          # @return [JSON] 
          def to_json
            { parameters: @parameters, code: @code }.to_json()
          end
          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object] 
          # @return [Void] 
          def self.validate_raw(obj:)
            obj.parameters.is_a?(Array) != false || raise("Passed value for field obj.parameters is not the expected type, validation failed.")
            FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
          end
        end
      end
    end
  end
end