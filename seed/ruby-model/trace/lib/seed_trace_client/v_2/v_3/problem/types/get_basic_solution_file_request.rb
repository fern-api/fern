# frozen_string_literal: true

require_relative "non_void_function_signature"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetBasicSolutionFileRequest
          attr_reader :method_name, :signature, :additional_properties

          # @param method_name [String]
          # @param signature [V2::V3::Problem::NonVoidFunctionSignature]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::GetBasicSolutionFileRequest]
          def initialize(method_name:, signature:, additional_properties: nil)
            # @type [String]
            @method_name = method_name
            # @type [V2::V3::Problem::NonVoidFunctionSignature]
            @signature = signature
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of GetBasicSolutionFileRequest
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::GetBasicSolutionFileRequest]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            method_name = struct.methodName
            if parsed_json["signature"].nil?
              signature = nil
            else
              signature = parsed_json["signature"].to_json
              signature = V2::V3::Problem::NonVoidFunctionSignature.from_json(json_object: signature)
            end
            new(method_name: method_name, signature: signature, additional_properties: struct)
          end

          # Serialize an instance of GetBasicSolutionFileRequest to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "methodName": @method_name, "signature": @signature }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
          #
          # @param obj [Object]
          # @return [Void]
          def self.validate_raw(obj:)
            obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
            V2::V3::Problem::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
          end
        end
      end
    end
  end
end
