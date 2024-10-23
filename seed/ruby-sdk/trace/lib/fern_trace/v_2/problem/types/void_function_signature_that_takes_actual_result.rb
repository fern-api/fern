# frozen_string_literal: true

require_relative "parameter"
require_relative "../../../commons/types/variable_type"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class VoidFunctionSignatureThatTakesActualResult
        # @return [Array<SeedTraceClient::V2::Problem::Parameter>]
        attr_reader :parameters
        # @return [SeedTraceClient::Commons::VariableType]
        attr_reader :actual_result_type
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param parameters [Array<SeedTraceClient::V2::Problem::Parameter>]
        # @param actual_result_type [SeedTraceClient::Commons::VariableType]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::VoidFunctionSignatureThatTakesActualResult]
        def initialize(parameters:, actual_result_type:, additional_properties: nil)
          @parameters = parameters
          @actual_result_type = actual_result_type
          @additional_properties = additional_properties
          @_field_set = { "parameters": parameters, "actualResultType": actual_result_type }
        end

        # Deserialize a JSON object to an instance of
        #  VoidFunctionSignatureThatTakesActualResult
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::VoidFunctionSignatureThatTakesActualResult]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          parameters = parsed_json["parameters"]&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::Problem::Parameter.from_json(json_object: item)
          end
          if parsed_json["actualResultType"].nil?
            actual_result_type = nil
          else
            actual_result_type = parsed_json["actualResultType"].to_json
            actual_result_type = SeedTraceClient::Commons::VariableType.from_json(json_object: actual_result_type)
          end
          new(
            parameters: parameters,
            actual_result_type: actual_result_type,
            additional_properties: struct
          )
        end

        # Serialize an instance of VoidFunctionSignatureThatTakesActualResult to a JSON
        #  object
        #
        # @return [String]
        def to_json(*_args)
          @_field_set&.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given
        #  hash and check each fields type against the current object's property
        #  definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.parameters.is_a?(Array) != false || raise("Passed value for field obj.parameters is not the expected type, validation failed.")
          SeedTraceClient::Commons::VariableType.validate_raw(obj: obj.actual_result_type)
        end
      end
    end
  end
end
