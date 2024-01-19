# frozen_string_literal: true
require "v_2/problem/types/Parameter"
require "v_2/problem/types/FunctionImplementationForMultipleLanguages"
require "json"

module SeedClient
  module V2
    module Problem
      class VoidFunctionDefinitionThatTakesActualResult
        attr_reader :additional_parameters, :code, :additional_properties
        # @param additional_parameters [Array<V2::Problem::Parameter>] 
        # @param code [V2::Problem::FunctionImplementationForMultipleLanguages] 
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::VoidFunctionDefinitionThatTakesActualResult] 
        def initialze(additional_parameters:, code:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>] 
          @additional_parameters = additional_parameters
          # @type [V2::Problem::FunctionImplementationForMultipleLanguages] 
          @code = code
          # @type [OpenStruct] 
          @additional_properties = additional_properties
        end
        # Deserialize a JSON object to an instance of VoidFunctionDefinitionThatTakesActualResult
        #
        # @param json_object [JSON] 
        # @return [V2::Problem::VoidFunctionDefinitionThatTakesActualResult] 
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          additional_parameters = struct.additionalParameters.map() do | v |
 V2::Problem::Parameter.from_json(json_object: v)
end
          code = V2::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: struct.code)
          new(additional_parameters: additional_parameters, code: code, additional_properties: struct)
        end
        # Serialize an instance of VoidFunctionDefinitionThatTakesActualResult to a JSON object
        #
        # @return [JSON] 
        def to_json
          {
 additionalParameters: @additional_parameters,
 code: @code
}.to_json()
        end
      end
    end
  end
end