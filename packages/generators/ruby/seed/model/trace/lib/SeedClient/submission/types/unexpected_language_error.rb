# frozen_string_literal: true
require "commons/types/Language"
require "commons/types/Language"
require "json"

module SeedClient
  module Submission
    class UnexpectedLanguageError
      attr_reader :expected_language, :actual_language, :additional_properties
      # @param expected_language [Commons::Language] 
      # @param actual_language [Commons::Language] 
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [Submission::UnexpectedLanguageError] 
      def initialze(expected_language:, actual_language:, additional_properties: nil)
        # @type [Commons::Language] 
        @expected_language = expected_language
        # @type [Commons::Language] 
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
        expected_language Commons::Language.from_json(json_object: struct.expectedLanguage)
        actual_language Commons::Language.from_json(json_object: struct.actualLanguage)
        new(expected_language: expected_language, actual_language: actual_language, additional_properties: struct)
      end
      # Serialize an instance of UnexpectedLanguageError to a JSON object
      #
      # @return [JSON] 
      def to_json
        { expectedLanguage: @expected_language, actualLanguage: @actual_language }.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        Language.validate_raw(obj: obj.expected_language)
        Language.validate_raw(obj: obj.actual_language)
      end
    end
  end
end