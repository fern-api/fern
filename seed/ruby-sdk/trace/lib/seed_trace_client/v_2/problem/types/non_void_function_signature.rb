# frozen_string_literal: true

require_relative "parameter"
require_relative "../../../commons/types/variable_type"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class NonVoidFunctionSignature
        attr_reader :parameters, :return_type, :additional_properties

        # @param parameters [Array<V2::Problem::Parameter>]
        # @param return_type [Commons::VariableType]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::NonVoidFunctionSignature]
        def initialize(parameters:, return_type:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>]
          @parameters = parameters
          # @type [Commons::VariableType]
          @return_type = return_type
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of NonVoidFunctionSignature
        #
        # @param json_object [JSON]
        # @return [V2::Problem::NonVoidFunctionSignature]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          parameters = parsed_json["parameters"]&.map do |v|
            v = v.to_json
            V2::Problem::Parameter.from_json(json_object: v)
          end
          if parsed_json["returnType"].nil?
            return_type = nil
          else
            return_type = parsed_json["returnType"].to_json
            return_type = Commons::VariableType.from_json(json_object: return_type)
          end
          new(parameters: parameters, return_type: return_type, additional_properties: struct)
        end

        # Serialize an instance of NonVoidFunctionSignature to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "parameters": @parameters, "returnType": @return_type }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.parameters.is_a?(Array) != false || raise("Passed value for field obj.parameters is not the expected type, validation failed.")
          Commons::VariableType.validate_raw(obj: obj.return_type)
        end
      end
    end
  end
end
