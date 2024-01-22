# frozen_string_literal: true
require "json"
require "submission/types/SubmissionIdNotFound"
require "submission/types/CustomTestCasesUnsupported"
require "submission/types/UnexpectedLanguageError"

module SeedClient
  module Submission
    class InvalidRequestCause
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::InvalidRequestCause] 
      def initialze(member:, discriminant:)
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
        case struct.type
        when "submission_id_not_found"
          member = Submission::SubmissionIdNotFound.from_json(json_object: json_object)
        when "custom_test_cases_unsupported"
          member = Submission::CustomTestCasesUnsupported.from_json(json_object: json_object)
        when "unexpected_language"
          member = Submission::UnexpectedLanguageError.from_json(json_object: json_object)
        else
          member = Submission::SubmissionIdNotFound.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "submission_id_not_found"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "custom_test_cases_unsupported"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "unexpected_language"
          { type: @discriminant, **@member.to_json() }.to_json()
        else
          { type: @discriminant, value: @member }.to_json()
        end
        @member.to_json()
      end
      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object] 
      # @return [Void] 
      def self.validate_raw(obj:)
        case obj.type
        when "submission_id_not_found"
          SubmissionIdNotFound.validate_raw(obj: obj)
        when "custom_test_cases_unsupported"
          CustomTestCasesUnsupported.validate_raw(obj: obj)
        when "unexpected_language"
          UnexpectedLanguageError.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end
      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object] 
      # @return [] 
      def is_a(obj)
        @member.is_a?(obj)
      end
      # @param member [Submission::SubmissionIdNotFound] 
      # @return [Submission::InvalidRequestCause] 
      def self.submission_id_not_found(member:)
        new(member: member, discriminant: "submission_id_not_found")
      end
      # @param member [Submission::CustomTestCasesUnsupported] 
      # @return [Submission::InvalidRequestCause] 
      def self.custom_test_cases_unsupported(member:)
        new(member: member, discriminant: "custom_test_cases_unsupported")
      end
      # @param member [Submission::UnexpectedLanguageError] 
      # @return [Submission::InvalidRequestCause] 
      def self.unexpected_language(member:)
        new(member: member, discriminant: "unexpected_language")
      end
    end
  end
end