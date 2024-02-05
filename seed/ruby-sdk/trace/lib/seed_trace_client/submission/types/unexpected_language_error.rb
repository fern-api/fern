# frozen_string_literal: true

require_relative "../../commons/types/language"
require "json"

module SeedTraceClient
  module Submission
    class UnexpectedLanguageError
      attr_reader :expected_language, :actual_language, :additional_properties

      # @param expected_language [LANGUAGE]
      # @param actual_language [LANGUAGE]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::UnexpectedLanguageError]
      def initialize(expected_language:, actual_language:, additional_properties: nil)
        # @type [LANGUAGE]
        @expected_language = expected_language
        # @type [LANGUAGE]
        @actual_language = actual_language
        # @type [OpenStruct] Additional properties unmapped to the current class definition
        @additional_properties = additional_properties
      end

      # Deserialize a JSON object to an instance of UnexpectedLanguageError
      #
      # @param json_object [JSON]
      # @return [Submission::UnexpectedLanguageError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        expected_language = Commons::LANGUAGE.key(parsed_json["expectedLanguage"]) || parsed_json["expectedLanguage"]
        actual_language = Commons::LANGUAGE.key(parsed_json["actualLanguage"]) || parsed_json["actualLanguage"]
        new(expected_language: expected_language, actual_language: actual_language, additional_properties: struct)
      end

      # Serialize an instance of UnexpectedLanguageError to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        {
          "expectedLanguage": Commons::LANGUAGE[@expected_language] || @expected_language,
          "actualLanguage": Commons::LANGUAGE[@actual_language] || @actual_language
        }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.expected_language.is_a?(Commons::LANGUAGE) != false || raise("Passed value for field obj.expected_language is not the expected type, validation failed.")
        obj.actual_language.is_a?(Commons::LANGUAGE) != false || raise("Passed value for field obj.actual_language is not the expected type, validation failed.")
      end
    end
  end
end
