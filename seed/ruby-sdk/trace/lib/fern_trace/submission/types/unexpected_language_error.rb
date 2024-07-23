# frozen_string_literal: true

require_relative "../../commons/types/language"
require "ostruct"
require "json"

module SeedTraceClient
  class Submission
    class UnexpectedLanguageError
      # @return [SeedTraceClient::Commons::Language]
      attr_reader :expected_language
      # @return [SeedTraceClient::Commons::Language]
      attr_reader :actual_language
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param expected_language [SeedTraceClient::Commons::Language]
      # @param actual_language [SeedTraceClient::Commons::Language]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedTraceClient::Submission::UnexpectedLanguageError]
      def initialize(expected_language:, actual_language:, additional_properties: nil)
        @expected_language = expected_language
        @actual_language = actual_language
        @additional_properties = additional_properties
        @_field_set = { "expectedLanguage": expected_language, "actualLanguage": actual_language }
      end

      # Deserialize a JSON object to an instance of UnexpectedLanguageError
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::UnexpectedLanguageError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        expected_language = parsed_json["expectedLanguage"]
        actual_language = parsed_json["actualLanguage"]
        new(
          expected_language: expected_language,
          actual_language: actual_language,
          additional_properties: struct
        )
      end

      # Serialize an instance of UnexpectedLanguageError to a JSON object
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
        obj.expected_language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.expected_language is not the expected type, validation failed.")
        obj.actual_language.is_a?(SeedTraceClient::Commons::Language) != false || raise("Passed value for field obj.actual_language is not the expected type, validation failed.")
      end
    end
  end
end
