# frozen_string_literal: true

require_relative "non_void_function_signature"
require "ostruct"
require "json"

module SeedTraceClient
  module V2
    class Problem
      class GetBasicSolutionFileRequest
        # @return [String]
        attr_reader :method_name
        # @return [SeedTraceClient::V2::Problem::NonVoidFunctionSignature]
        attr_reader :signature
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param method_name [String]
        # @param signature [SeedTraceClient::V2::Problem::NonVoidFunctionSignature]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedTraceClient::V2::Problem::GetBasicSolutionFileRequest]
        def initialize(method_name:, signature:, additional_properties: nil)
          @method_name = method_name
          @signature = signature
          @additional_properties = additional_properties
          @_field_set = { "methodName": method_name, "signature": signature }
        end

        # Deserialize a JSON object to an instance of GetBasicSolutionFileRequest
        #
        # @param json_object [String]
        # @return [SeedTraceClient::V2::Problem::GetBasicSolutionFileRequest]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          method_name = parsed_json["methodName"]
          if parsed_json["signature"].nil?
            signature = nil
          else
            signature = parsed_json["signature"].to_json
            signature = SeedTraceClient::V2::Problem::NonVoidFunctionSignature.from_json(json_object: signature)
          end
          new(
            method_name: method_name,
            signature: signature,
            additional_properties: struct
          )
        end

        # Serialize an instance of GetBasicSolutionFileRequest to a JSON object
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
          obj.method_name.is_a?(String) != false || raise("Passed value for field obj.method_name is not the expected type, validation failed.")
          SeedTraceClient::V2::Problem::NonVoidFunctionSignature.validate_raw(obj: obj.signature)
        end
      end
    end
  end
end
