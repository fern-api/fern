# frozen_string_literal: true
require "json"
require "submission/types/CompileError"
require "submission/types/RuntimeError"
require "submission/types/InternalError"

module SeedClient
  module Submission
    class ErrorInfo
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Submission::ErrorInfo] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of ErrorInfo
      #
      # @param json_object [JSON] 
      # @return [Submission::ErrorInfo] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "compileError"
          member = Submission::CompileError.from_json(json_object: json_object)
        when "runtimeError"
          member = Submission::RuntimeError.from_json(json_object: json_object)
        when "internalError"
          member = Submission::InternalError.from_json(json_object: json_object)
        else
          member = Submission::CompileError.from_json(json_object: json_object)
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "compileError"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "runtimeError"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "internalError"
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
        when "compileError"
          CompileError.validate_raw(obj: obj)
        when "runtimeError"
          RuntimeError.validate_raw(obj: obj)
        when "internalError"
          InternalError.validate_raw(obj: obj)
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
      # @param member [Submission::CompileError] 
      # @return [Submission::ErrorInfo] 
      def self.compile_error(member:)
        new(member: member, discriminant: "compileError")
      end
      # @param member [Submission::RuntimeError] 
      # @return [Submission::ErrorInfo] 
      def self.runtime_error(member:)
        new(member: member, discriminant: "runtimeError")
      end
      # @param member [Submission::InternalError] 
      # @return [Submission::ErrorInfo] 
      def self.internal_error(member:)
        new(member: member, discriminant: "internalError")
      end
    end
  end
end