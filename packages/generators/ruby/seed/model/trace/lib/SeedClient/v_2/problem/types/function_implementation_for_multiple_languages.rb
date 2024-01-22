# frozen_string_literal: true

require "json"

module SeedClient
  module V2
    module Problem
      class FunctionImplementationForMultipleLanguages
        attr_reader :code_by_language, :additional_properties

        # @param code_by_language [Hash{LANGUAGE => LANGUAGE}]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [V2::Problem::FunctionImplementationForMultipleLanguages]
        def initialze(code_by_language:, additional_properties: nil)
          # @type [Hash{LANGUAGE => LANGUAGE}]
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
          code_by_language = struct.codeByLanguage.transform_values do |v|
            LANGUAGE.key(v)
          end
          new(code_by_language: code_by_language, additional_properties: struct)
        end

        # Serialize an instance of FunctionImplementationForMultipleLanguages to a JSON object
        #
        # @return [JSON]
        def to_json(*_args)
          { codeByLanguage: @code_by_language.transform_values do |v|
                              LANGUAGE.key(v)
                            end }.to_json
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
