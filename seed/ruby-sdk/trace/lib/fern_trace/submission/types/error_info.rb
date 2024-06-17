# frozen_string_literal: true

require "json"
require_relative "compile_error"
require_relative "runtime_error"
require_relative "internal_error"

module SeedTraceClient
  class Submission
    class ErrorInfo
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Submission::ErrorInfo]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of ErrorInfo
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Submission::ErrorInfo]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "compileError"
                   SeedTraceClient::Submission::CompileError.from_json(json_object: json_object)
                 when "runtimeError"
                   SeedTraceClient::Submission::RuntimeError.from_json(json_object: json_object)
                 when "internalError"
                   SeedTraceClient::Submission::InternalError.from_json(json_object: json_object)
                 else
                   SeedTraceClient::Submission::CompileError.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "compileError"
          { **@member.to_json, type: @discriminant }.to_json
        when "runtimeError"
          { **@member.to_json, type: @discriminant }.to_json
        when "internalError"
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
        when "compileError"
          SeedTraceClient::Submission::CompileError.validate_raw(obj: obj)
        when "runtimeError"
          SeedTraceClient::Submission::RuntimeError.validate_raw(obj: obj)
        when "internalError"
          SeedTraceClient::Submission::InternalError.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Submission::CompileError]
      # @return [SeedTraceClient::Submission::ErrorInfo]
      def self.compile_error(member:)
        new(member: member, discriminant: "compileError")
      end

      # @param member [SeedTraceClient::Submission::RuntimeError]
      # @return [SeedTraceClient::Submission::ErrorInfo]
      def self.runtime_error(member:)
        new(member: member, discriminant: "runtimeError")
      end

      # @param member [SeedTraceClient::Submission::InternalError]
      # @return [SeedTraceClient::Submission::ErrorInfo]
      def self.internal_error(member:)
        new(member: member, discriminant: "internalError")
      end
    end
  end
end
