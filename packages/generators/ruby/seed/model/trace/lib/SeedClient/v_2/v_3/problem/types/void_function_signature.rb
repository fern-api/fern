# frozen_string_literal: true
require "v_2/v_3/problem/types/Parameter"
require "json"

module SeedClient
  module V2
    module V3
      module Problem
        class VoidFunctionSignature
          attr_reader :parameters, :additional_properties
          # @param parameters [Array<V2::V3::Problem::Parameter>] 
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::VoidFunctionSignature] 
          def initialze(parameters:, additional_properties: nil)
            # @type [Array<V2::V3::Problem::Parameter>] 
            @parameters = parameters
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end
          # Deserialize a JSON object to an instance of VoidFunctionSignature
          #
          # @param json_object [JSON] 
          # @return [V2::V3::Problem::VoidFunctionSignature] 
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parameters struct.parameters.map() do | v |
  V2::V3::Problem::Parameter.from_json(json_object: v)
end
            new(parameters: parameters, additional_properties: struct)
          end
          # Serialize an instance of VoidFunctionSignature to a JSON object
          #
          # @return [JSON] 
          def to_json
            { parameters: @parameters }.to_json()
          end
          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object] 
          # @return [Void] 
          def self.validate_raw(obj:)
            obj.parameters.is_a?(Array) != false || raise("Passed value for field obj.parameters is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end