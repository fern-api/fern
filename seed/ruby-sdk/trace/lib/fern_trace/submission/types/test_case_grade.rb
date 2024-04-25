# frozen_string_literal: true

require "json"
require_relative "test_case_hidden_grade"
require_relative "test_case_non_hidden_grade"

module SeedTraceClient
  class Submission
    class TestCaseGrade
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::TestCaseGrade]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of TestCaseGrade
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::TestCaseGrade]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "hidden"
                   SeedTraceClient::Submission::TestCaseHiddenGrade.from_json(json_object: json_object)
                 when "nonHidden"
                   SeedTraceClient::Submission::TestCaseNonHiddenGrade.from_json(json_object: json_object)
                 else
                   SeedTraceClient::Submission::TestCaseHiddenGrade.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
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

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "hidden"
          SeedTraceClient::Submission::TestCaseHiddenGrade.validate_raw(obj: obj)
        when "nonHidden"
          SeedTraceClient::Submission::TestCaseNonHiddenGrade.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::TestCaseHiddenGrade]
      # @return [SeedTraceClient::Submission::TestCaseGrade]
      def self.hidden(member:)
        new(member: member, discriminant: "hidden")
      end

      # @param member [SeedTraceClient::Submission::TestCaseNonHiddenGrade]
      # @return [SeedTraceClient::Submission::TestCaseGrade]
      def self.non_hidden(member:)
        new(member: member, discriminant: "nonHidden")
      end
    end
  end
end
