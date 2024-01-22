# frozen_string_literal: true

require "json"

module SeedClient
  module Submission
    class UnexpectedLanguageError
      attr_reader :expected_language, :actual_language, :additional_properties

      # @param expected_language [Hash{String => String}]
      # @param actual_language [Hash{String => String}]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::UnexpectedLanguageError]
      def initialze(expected_language:, actual_language:, additional_properties: nil)
        # @type [Hash{String => String}]
        @expected_language = expected_language
        # @type [Hash{String => String}]
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
        expected_language = LANGUAGE.key(struct.expectedLanguage)
        actual_language = LANGUAGE.key(struct.actualLanguage)
        new(expected_language: expected_language, actual_language: actual_language, additional_properties: struct)
      end

      # Serialize an instance of UnexpectedLanguageError to a JSON object
      #
      # @return [JSON]
      def to_json(*_args)
        { expectedLanguage: @expected_language.fetch, actualLanguage: @actual_language.fetch }.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        obj.expected_language.is_a?(LANGUAGE) != false || raise("Passed value for field obj.expected_language is not the expected type, validation failed.")
        obj.actual_language.is_a?(LANGUAGE) != false || raise("Passed value for field obj.actual_language is not the expected type, validation failed.")
      end
    end
  end
end
