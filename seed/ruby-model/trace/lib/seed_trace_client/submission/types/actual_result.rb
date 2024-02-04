# frozen_string_literal: true

require "json"
require_relative "../../commons/types/variable_value"
require_relative "exception_info"
require_relative "exception_v_2"

module SeedTraceClient
  module Submission
    class ActualResult
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Submission::ActualResult]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of ActualResult
      #
      # @param json_object [JSON]
      # @return [Submission::ActualResult]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "value"
                   Commons::VariableValue.from_json(json_object: json_object.value)
                 when "exception"
                   Submission::ExceptionInfo.from_json(json_object: json_object)
                 when "exceptionV2"
                   Submission::ExceptionV2.from_json(json_object: json_object.value)
                 else
                   Commons::VariableValue.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "value"
          { "type": @discriminant, "value": @member }.to_json
        when "exception"
          { **@member.to_json, type: @discriminant }.to_json
        when "exceptionV2"
          { "type": @discriminant, "value": @member }.to_json
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
        when "value"
          Commons::VariableValue.validate_raw(obj: obj)
        when "exception"
          Submission::ExceptionInfo.validate_raw(obj: obj)
        when "exceptionV2"
          Submission::ExceptionV2.validate_raw(obj: obj)
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

      # @param member [Commons::VariableValue]
      # @return [Submission::ActualResult]
      def self.value(member:)
        new(member: member, discriminant: "value")
      end

      # @param member [Submission::ExceptionInfo]
      # @return [Submission::ActualResult]
      def self.exception(member:)
        new(member: member, discriminant: "exception")
      end

      # @param member [Submission::ExceptionV2]
      # @return [Submission::ActualResult]
      def self.exception_v_2(member:)
        new(member: member, discriminant: "exceptionV2")
      end
    end
  end
end
