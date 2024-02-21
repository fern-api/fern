# frozen_string_literal: true

require_relative "non_void_function_signature"
require_relative "function_implementation_for_multiple_languages"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class NonVoidFunctionDefinition
        attr_reader :signature, :code, :additional_properties

        # @param signature [V2::Problem::NonVoidFunctionSignature]
        # @param code [V2::Problem::FunctionImplementationForMultipleLanguages]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::NonVoidFunctionDefinition]
        def initialize(signature:, code:, additional_properties: nil)
          # @type [V2::Problem::NonVoidFunctionSignature]
          @signature = signature
          # @type [V2::Problem::FunctionImplementationForMultipleLanguages]
          @code = code
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of NonVoidFunctionDefinition
        #
        # @param json_object [JSON]
        # @return [V2::Problem::NonVoidFunctionDefinition]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          if parsed_json["signature"].nil?
            signature = nil
          else
            signature = parsed_json["signature"].to_json
            signature = V2::Problem::NonVoidFunctionSignature.from_json(json_object: signature)
          end
          if parsed_json["code"].nil?
            code = nil
          else
            code = parsed_json["code"].to_json
            code = V2::Problem::FunctionImplementationForMultipleLanguages.from_json(json_object: code)
          end
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
          V2::Problem::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
          V2::Problem::FunctionImplementationForMultipleLanguages.validate_raw(obj: obj.code)
        end
      end
    end
  end
end
