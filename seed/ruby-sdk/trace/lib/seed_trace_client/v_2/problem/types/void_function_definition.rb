# frozen_string_literal: true

require_relative "parameter"
require_relative "function_implementation_for_multiple_languages"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class VoidFunctionDefinition
        attr_reader :parameters, :code, :additional_properties

        # @param parameters [Array<V2::Problem::Parameter>]
        # @param code [V2::Problem::FunctionImplementationForMultipleLanguages]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::VoidFunctionDefinition]
        def initialize(parameters:, code:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>]
          @parameters = parameters
          # @type [V2::Problem::FunctionImplementationForMultipleLanguages]
          @code = code
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of VoidFunctionDefinition
        #
        # @param json_object [JSON]
        # @return [V2::Problem::VoidFunctionDefinition]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          parameters = parsed_json["parameters"]&.map do |v|
            v = v.to_json
            V2::Problem::Parameter.from_json(json_object: v)
          end
          if parsed_json["code"].nil?
            code = nil
          else
            code = parsed_json["code"].to_json
            code = V2::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: code)
          end
          new(parameters: parameters, code: code, additional_properties: struct)
        end

        # Serialize an instance of VoidFunctionDefinition to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "parameters": @parameters, "code": @code }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.parameters.is_a?(Array) != false || raise("Passed value for field obj.parameters is not the expected type, validation failed.")
          V2::Problem::FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
        end
      end
    end
  end
end
