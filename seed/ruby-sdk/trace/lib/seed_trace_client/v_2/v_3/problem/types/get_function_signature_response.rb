# frozen_string_literal: true

require "json"

module SeedTraceClient
  module V2
    module V3
      class Problem
        class GetFunctionSignatureResponse
          attr_reader :function_by_language, :additional_properties

          # @param function_by_language [Hash{Commons::Language => Commons::Language}]
          # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
          # @return [V2::V3::Problem::GetFunctionSignatureResponse]
          def initialize(function_by_language:, additional_properties: nil)
            # @type [Hash{Commons::Language => Commons::Language}]
            @function_by_language = function_by_language
            # @type [OpenStruct] Additional properties unmapped to the current class definition
            @additional_properties = additional_properties
          end

          # Deserialize a JSON object to an instance of GetFunctionSignatureResponse
          #
          # @param json_object [JSON]
          # @return [V2::V3::Problem::GetFunctionSignatureResponse]
          def self.from_json(json_object:)
            struct = JSON.parse(json_object, object_class: OpenStruct)
            JSON.parse(json_object)
            function_by_language = struct.functionByLanguage
            new(function_by_language: function_by_language, additional_properties: struct)
          end

          # Serialize an instance of GetFunctionSignatureResponse to a JSON object
          #
          # @return [JSON]
          def to_json(*_args)
            { "functionByLanguage": @function_by_language }.to_json
          end

          # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
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
