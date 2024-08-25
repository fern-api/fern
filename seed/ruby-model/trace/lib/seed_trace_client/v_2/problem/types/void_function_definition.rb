# frozen_string_literal: true

require_relative "parameter"
require_relative "function_implementation_for_multiple_languages"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class VoidFunctionDefinition
        # @return [Array<SeedTraceClient::V2::Problem::Parameter>]
        attr_reader :parameters
        # @return [SeedTraceClient::V2::Problem::FunctionImplementationForMultipleLanguages]
        attr_reader :code
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param parameters [Array<SeedTraceClient::V2::Problem::Parameter>]
        # @param code [SeedTraceClient::V2::Problem::FunctionImplementationForMultipleLanguages]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::VoidFunctionDefinition]
        def initialize(parameters:, code:, additional_properties: nil)
          @parameters = parameters
          @code = code
          @additional_properties = additional_properties
          @_field_set = { "parameters": parameters, "code": code }
        end

        # Deserialize a JSON object to an instance of VoidFunctionDefinition
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::VoidFunctionDefinition]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          parameters = parsed_json["parameters"]&.map do |item|
            item = item.to_json
            SeedTraceClient::V2::Problem::Parameter.from_json(json_object: item)
          end
          if parsed_json["code"].nil?
            code = nil
          else
            code = parsed_json["code"].to_json
            code = SeedTraceClient::V2::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: code)
          end
          new(
            parameters: parameters,
            code: code,
            additional_properties: struct
          )
        end

        # Serialize an instance of VoidFunctionDefinition to a JSON object
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
          SeedTraceClient::V2::Problem::FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
        end
      end
    end
  end
end
