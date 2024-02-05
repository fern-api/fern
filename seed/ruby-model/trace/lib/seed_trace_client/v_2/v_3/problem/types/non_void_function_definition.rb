# frozen_string_literal: true

require_relative "non_void_function_signature"
require_relative "function_implementation_for_multiple_languages"
require "json"

module SeedTraceClient
  module V2
    module V3
      module Problem
        class NonVoidFunctionDefinition
          attr_reader :signature, :code, :additional_properties

          # @param signature [V2::V3::Problem::NonVoidFunctionSignature]
          # @param code [V2::V3::Problem::FunctionImplementationForMultipleLanguages]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::NonVoidFunctionDefinition]
          def initialize(signature:, code:, additional_properties: nil)
            # @type [V2::V3::Problem::NonVoidFunctionSignature]
            @signature = signature
            # @type [V2::V3::Problem::FunctionImplementationForMultipleLanguages]
            @code = code
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of NonVoidFunctionDefinition
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::NonVoidFunctionDefinition]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            signature = struct.signature.to_h.to_json
            signature = V2::V3::Problem::NonVoidFunctionSignature.from_json(json_object: signature)
            code = struct.code.to_h.to_json
            code = V2::V3::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: code)
            new(signature: signature, code: code, additional_properties: struct)
          end

          # Serialize an instance of NonVoidFunctionDefinition to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "signature": @signature, "code": @code }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            V2::V3::Problem::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
            V2::V3::Problem::FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
          end
        end
      end
    end
  end
end
