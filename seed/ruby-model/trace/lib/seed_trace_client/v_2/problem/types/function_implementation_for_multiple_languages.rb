# frozen_string_literal: true

require "json"

module SeedTraceClient
  module V2
    class Problem
      class FunctionImplementationForMultipleLanguages
        attr_reader :code_by_language, :additional_properties

        # @param code_by_language [Hash{Commons::Language => V2::Problem::FunctionImplementation}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::FunctionImplementationForMultipleLanguages]
        def initialize(code_by_language:, additional_properties: nil)
          # @type [Hash{Commons::Language => V2::Problem::FunctionImplementation}]
          @code_by_language = code_by_language
          # @type [OpenStruct] Additional properties unmapped to the current class definition
          @additional_properties = additional_properties
        end

        # Deserialize a JSON object to an instance of FunctionImplementationForMultipleLanguages
        #
        # @param json_object [JSON]
        # @return [V2::Problem::FunctionImplementationForMultipleLanguages]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          code_by_language = parsed_json["codeByLanguage"]&.transform_values do |_k, v|
            v = v.to_json
            V2::Problem::FunctionImplementation.from_json(json_object: v)
          end
          new(code_by_language: code_by_language, additional_properties: struct)
        end

        # Serialize an instance of FunctionImplementationForMultipleLanguages to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { "codeByLanguage": @code_by_language }.to_json
        end

        # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
        #
        # @param obj [Object]
        # @return [Void]
        def self.validate_raw(obj:)
          obj.code_by_language.is_a?(Hash) != false || raise("Passed value for field obj.code_by_language is not the expected type, validation failed.")
        end
      end
    end
  end
end
