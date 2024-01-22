# frozen_string_literal: true
require "json"
require "submission/types/TestCaseHiddenGrade"
require "submission/types/TestCaseNonHiddenGrade"

module SeedClient
  module Submission
    class TestCaseGrade
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::TestCaseGrade] 
      def initialze(member:, discriminant:)
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
        case struct.type
        when "hidden"
          member = Submission::TestCaseHiddenGrade.from_json(json_object: json_object)
        when "non_hidden"
          member = Submission::TestCaseNonHiddenGrade.from_json(json_object: json_object)
        else
          member = Submission::TestCaseHiddenGrade.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "hidden"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "non_hidden"
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
        when "hidden"
          TestCaseHiddenGrade.validate_raw(obj: obj)
        when "non_hidden"
          TestCaseNonHiddenGrade.validate_raw(obj: obj)
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
      # @param member [Submission::TestCaseHiddenGrade] 
      # @return [Submission::TestCaseGrade] 
      def self.hidden(member:)
        new(member: member, discriminant: "hidden")
      end
      # @param member [Submission::TestCaseNonHiddenGrade] 
      # @return [Submission::TestCaseGrade] 
      def self.non_hidden(member:)
        new(member: member, discriminant: "non_hidden")
      end
    end
  end
end