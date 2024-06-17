# frozen_string_literal: true

require_relative "parameter"
require_relative "function_implementation_for_multiple_languages"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class VoidFunctionDefinition
          # @return [Array<V2::V3::Parameter>]
          attr_reader :parameters
          # @return [V2::V3::FunctionImplementationForMultipleLanguages]
          attr_reader :code
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param parameters [Array<V2::V3::Parameter>]
          # @param code [V2::V3::FunctionImplementationForMultipleLanguages]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::VoidFunctionDefinition]
          def initialize(parameters:, code:, additional_properties: nil)
            @parameters = parameters
            @code = code
            @additional_properties = additional_properties
            @_field_set = { "parameters": parameters, "code": code }
          end

          # Deserialize a JSON object to an instance of VoidFunctionDefinition
          #
          # @param json_object [String]
          # @return [V2::V3::VoidFunctionDefinition]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            parameters = parsed_json["parameters"]&.map do |v|
              v = v.to_json
              V2::V3::Parameter.from_json(json_object: v)
            end
            if parsed_json["code"].nil?
              code = nil
            else
              code = parsed_json["code"].to_json
              code = V2::V3::FunctionImplementationForMultipleLanguages.from_json(json_object: code)
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
            V2::V3::FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
          end
        end
      end
    end
  end
end
