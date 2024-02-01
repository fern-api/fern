# frozen_string_literal: true

require_relative "parameter"
require_relative "../../../commons/types/variable_type"
require "json"

module SeedTraceClient
  module V2
    module Problem
      class VoidFunctionSignatureThatTakesActualResult
        attr_reader :parameters, :actual_result_type, :additional_properties

        # @param parameters [Array<V2::Problem::Parameter>]
        # @param actual_result_type [Commons::VariableType]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::VoidFunctionSignatureThatTakesActualResult]
        def initialize(parameters:, actual_result_type:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>]
          @parameters = parameters
          # @type [Commons::VariableType]
          @actual_result_type = actual_result_type
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of VoidFunctionSignatureThatTakesActualResult
        #
        # @param json_object [JSON]
        # @return [V2::Problem::VoidFunctionSignatureThatTakesActualResult]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parameters = struct.parameters
          actual_result_type = struct.actualResultType
          new(parameters: parameters, actual_result_type: actual_result_type, additional_properties: struct)
        end

        # Serialize an instance of VoidFunctionSignatureThatTakesActualResult to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "parameters": @parameters, "actualResultType": @actual_result_type }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.parameters.is_a?(Array) != false || raise("Passed value for field obj.parameters is not the expected type, validation failed.")
          Commons::VariableType.validate_raw(obj: obj.actual_result_type)
        end
      end
    end
  end
end
