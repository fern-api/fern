# frozen_string_literal: true

require "ostruct"
require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetFunctionSignatureResponse
          # @return [Hash{SeedTraceClient::Commons::Language => String}]
          attr_reader :function_by_language
          # @return [OpenStruct] Additional properties unmapped to the current class definition
          attr_reader :additional_properties
          # @return [Object]
          attr_reader :_field_set
          protected :_field_set

          OMIT = Object.new

          # @param function_by_language [Hash{SeedTraceClient::Commons::Language => String}]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [SeedTraceClient::V2::V3::Problem::GetFunctionSignatureResponse]
          def initialize(function_by_language:, additional_properties: nil)
            @function_by_language = function_by_language
            @additional_properties = additional_properties
            @_field_set = { "functionByLanguage": function_by_language }
          end

          # Deserialize a JSON object to an instance of GetFunctionSignatureResponse
          #
          # @param json_object [String]
          # @return [SeedTraceClient::V2::V3::Problem::GetFunctionSignatureResponse]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            parsed_json = JSON.parse(json_object)
            function_by_language = parsed_json["functionByLanguage"]
            new(function_by_language: function_by_language, additional_properties: struct)
          end

          # Serialize an instance of GetFunctionSignatureResponse to a JSON object
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
            obj.function_by_language.is_a?(Hash) != false || raise("Passed value for field obj.function_by_language is not the expected type, validation failed.")
          end
        end
      end
    end
  end
end
