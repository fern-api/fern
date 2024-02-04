# frozen_string_literal: true

require "json"
require_relative "test_case_hidden_grade"
require_relative "test_case_non_hidden_grade"

module SeedTraceClient
  module Submission
    class TestCaseGrade
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::TestCaseGrade]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of TestCaseGrade
      #
      # @param json_object [JSON]
      # @return [Submission::TestCaseGrade]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "hidden"
                   Submission::TestCaseHiddenGrade.from_json(json_object: json_object)
                 when "nonHidden"
                   Submission::TestCaseNonHiddenGrade.from_json(json_object: json_object)
                 else
                   Submission::TestCaseHiddenGrade.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "hidden"
          { **@member.to_json, type: @discriminant }.to_json
        when "nonHidden"
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
        when "hidden"
          Submission::TestCaseHiddenGrade.validate_raw(obj: obj)
        when "nonHidden"
          Submission::TestCaseNonHiddenGrade.validate_raw(obj: obj)
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

      # @param member [Submission::TestCaseHiddenGrade]
      # @return [Submission::TestCaseGrade]
      def self.hidden(member:)
        new(member: member, discriminant: "hidden")
      end

      # @param member [Submission::TestCaseNonHiddenGrade]
      # @return [Submission::TestCaseGrade]
      def self.non_hidden(member:)
        new(member: member, discriminant: "nonHidden")
      end
    end
  end
end
