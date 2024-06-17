# frozen_string_literal: true

require_relative "non_void_function_signature"
require_relative "function_implementation_for_multiple_languages"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class NonVoidFunctionDefinition
          # @return [V2::V3::NonVoidFunctionSignature]
          attr_reader :signature
          # @return [V2::V3::FunctionImplementationForMultipleLanguages]
          attr_reader :code
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param signature [V2::V3::NonVoidFunctionSignature]
          # @param code [V2::V3::FunctionImplementationForMultipleLanguages]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::NonVoidFunctionDefinition]
          def initialize(signature:, code:, additional_properties: nil)
            @signature = signature
            @code = code
            @additional_properties = additional_properties
            @_field_set = { "signature": signature, "code": code }
          end

          # Deserialize a JSON object to an instance of NonVoidFunctionDefinition
          #
          # @param json_object [String]
          # @return [V2::V3::NonVoidFunctionDefinition]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["signature"].nil?
              signature = nil
            else
              signature = parsed_json["signature"].to_json
              signature = V2::V3::NonVoidFunctionSignature.from_json(json_object: signature)
            end
            if parsed_json["code"].nil?
              code = nil
            else
              code = parsed_json["code"].to_json
              code = V2::V3::FunctionImplementationForMultipleLanguages.from_json(json_object: code)
            end
            new(
              signature: signature,
              code: code,
              additional_properties: struct
            )
          end

          # Serialize an instance of NonVoidFunctionDefinition to a JSON object
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
            V2::V3::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
            V2::V3::FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
          end
        end
      end
    end
  end
end
