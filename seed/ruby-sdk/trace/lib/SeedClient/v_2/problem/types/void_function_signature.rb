# frozen_string_literal: true

require_relative "parameter"
require "json"

module SeedClient
  module V2
    module Problem
      class VoidFunctionSignature
        attr_reader :parameters, :additional_properties

        # @param parameters [Array<V2::Problem::Parameter>]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::VoidFunctionSignature]
        def initialize(parameters:, additional_properties: nil)
          # @type [Array<V2::Problem::Parameter>]
          @parameters = parameters
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of VoidFunctionSignature
        #
        # @param json_object [JSON]
        # @return [V2::Problem::VoidFunctionSignature]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parameters = struct.parameters.map do |v|
            v = v.to_h.to_json
            V2::Problem::Parameter.from_json(json_object: v)
          end
          new(parameters: parameters, additional_properties: struct)
        end

        # Serialize an instance of VoidFunctionSignature to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "parameters": @parameters }.to_json
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
