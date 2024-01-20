# frozen_string_literal: true

require_relative "v_2/problem/types/Parameter"
require_relative "commons/types/VariableType"
require "json"

module SeedClient
  module V2
    module Problem
      class NonVoidFunctionSignature
        attr_reader :parameters, :return_type, :additional_properties

        # @param parameters [Array<V2::Problem::Parameter>]
        # @param return_type [Commons::VariableType]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::NonVoidFunctionSignature]
        def initialze(parameters:, return_type:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>]
          @parameters = parameters
          # @type [Commons::VariableType]
          @return_type = return_type
          # @type [OpenStruct]
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of NonVoidFunctionSignature
        #
        # @param json_object [JSON]
        # @return [V2::Problem::NonVoidFunctionSignature]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parameters = struct.parameters.map do |v|
            V2::Problem::Parameter.from_json(json_object: v)
          end
          return_type = Commons::VariableType.from_json(json_object: struct.returnType)
          new(parameters: parameters, return_type: return_type, additional_properties: struct)
        end

        # Serialize an instance of NonVoidFunctionSignature to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          {
            parameters: @parameters,
            returnType: @return_type
          }.to_json
        end
      end
    end
  end
end
