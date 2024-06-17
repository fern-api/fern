# frozen_string_literal: true

require_relative "function_signature"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetFunctionSignatureRequest
          # @return [SeedTraceClient::V2::V3::Problem::FunctionSignature]
          attr_reader :function_signature
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param function_signature [SeedTraceClient::V2::V3::Problem::FunctionSignature]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::GetFunctionSignatureRequest]
          def initialize(function_signature:, additional_properties: nil)
            @function_signature = function_signature
            @additional_properties = additional_properties
            @_field_set = { "functionSignature": function_signature }
          end

          # Deserialize a JSON object to an instance of GetFunctionSignatureRequest
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::GetFunctionSignatureRequest]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            if parsed_json["functionSignature"].nil?
              function_signature = nil
            else
              function_signature = parsed_json["functionSignature"].to_json
              function_signature = SeedTraceClient::V2::V3::Problem::FunctionSignature.from_json(json_object: function_signature)
            end
            new(function_signature: function_signature, additional_properties: struct)
          end

          # Serialize an instance of GetFunctionSignatureRequest to a JSON object
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
            SeedTraceClient::V2::V3::Problem::FunctionSignature.validate_raw(obj: obj.function_signature)
          end
        end
      end
    end
  end
end
