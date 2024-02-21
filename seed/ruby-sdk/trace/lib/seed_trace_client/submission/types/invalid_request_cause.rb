# frozen_string_literal: true

require "json"
require_relative "submission_id_not_found"
require_relative "custom_test_cases_unsupported"
require_relative "unexpected_language_error"

module SeedTraceClient
  class Submission
    class InvalidRequestCause
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::InvalidRequestCause]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of InvalidRequestCause
      #
      # @param json_object [JSON]
      # @return [Submission::InvalidRequestCause]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "submissionIdNotFound"
                   Submission::SubmissionIdNotFound.from_json(json_object: json_object)
                 when "customTestCasesUnsupported"
                   Submission::CustomTestCasesUnsupported.from_json(json_object: json_object)
                 when "unexpectedLanguage"
                   Submission::UnexpectedLanguageError.from_json(json_object: json_object)
                 else
                   Submission::SubmissionIdNotFound.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "submissionIdNotFound"
          { **@member.to_json, type: @discriminant }.to_json
        when "customTestCasesUnsupported"
          { **@member.to_json, type: @discriminant }.to_json
        when "unexpectedLanguage"
          { **@member.to_json, type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "submissionIdNotFound"
          Submission::SubmissionIdNotFound.validate_raw(obj: obj)
        when "customTestCasesUnsupported"
          Submission::CustomTestCasesUnsupported.validate_raw(obj: obj)
        when "unexpectedLanguage"
          Submission::UnexpectedLanguageError.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [Submission::SubmissionIdNotFound]
      # @return [Submission::InvalidRequestCause]
      def self.submission_id_not_found(member:)
        new(member: member, discriminant: "submissionIdNotFound")
      end

      # @param member [Submission::CustomTestCasesUnsupported]
      # @return [Submission::InvalidRequestCause]
      def self.custom_test_cases_unsupported(member:)
        new(member: member, discriminant: "customTestCasesUnsupported")
      end

      # @param member [Submission::UnexpectedLanguageError]
      # @return [Submission::InvalidRequestCause]
      def self.unexpected_language(member:)
        new(member: member, discriminant: "unexpectedLanguage")
      end
    end
  end
end
