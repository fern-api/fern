# frozen_string_literal: true

require_relative "function_signature"
require "json"

module SeedTraceClient
  module V2
    module V3
      module Problem
        class GetFunctionSignatureRequest
          attr_reader :function_signature, :additional_properties

          # @param function_signature [V2::V3::Problem::FunctionSignature]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::GetFunctionSignatureRequest]
          def initialize(function_signature:, additional_properties: nil)
            # @type [V2::V3::Problem::FunctionSignature]
            @function_signature = function_signature
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of GetFunctionSignatureRequest
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::GetFunctionSignatureRequest]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            function_signature = struct.functionSignature.to_h.to_json
            function_signature = V2::V3::Problem::FunctionSignature.from_json(json_object: function_signature)
            new(function_signature: function_signature, additional_properties: struct)
          end

          # Serialize an instance of GetFunctionSignatureRequest to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "functionSignature": @function_signature }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            V2::V3::Problem::FunctionSignature.validate_raw(obj: obj.function_signature)
          end
        end
      end
    end
  end
end
