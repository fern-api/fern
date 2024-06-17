# frozen_string_literal: true

require_relative "parameter"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class VoidFunctionSignature
        # @return [Array<V2::Parameter>]
        attr_reader :parameters
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param parameters [Array<V2::Parameter>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::VoidFunctionSignature]
        def initialize(parameters:, additional_properties: nil)
          @parameters = parameters
          @additional_properties = additional_properties
          @_field_set = { "parameters": parameters }
        end

        # Deserialize a JSON object to an instance of VoidFunctionSignature
        #
        # @param json_object [String]
        # @return [V2::VoidFunctionSignature]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          parameters = parsed_json["parameters"]&.map do |v|
            v = v.to_json
            V2::Parameter.from_json(json_object: v)
          end
          new(parameters: parameters, additional_properties: struct)
        end

        # Serialize an instance of VoidFunctionSignature to a JSON object
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
        end
      end
    end
  end
end
