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
        when "compile_error"
          member = Submission::CompileError.from_json(json_object: json_object)
        when "runtime_error"
          member = Submission::RuntimeError.from_json(json_object: json_object)
        when "internal_error"
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
        when "compile_error"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "runtime_error"
          { type: @discriminant, **@member.to_json() }.to_json()
        when "internal_error"
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
        when "compile_error"
          CompileError.validate_raw(obj: obj)
        when "runtime_error"
          RuntimeError.validate_raw(obj: obj)
        when "internal_error"
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
        new(member: member, discriminant: "compile_error")
      end
      # @param member [Submission::RuntimeError] 
      # @return [Submission::ErrorInfo] 
      def self.runtime_error(member:)
        new(member: member, discriminant: "runtime_error")
      end
      # @param member [Submission::InternalError] 
      # @return [Submission::ErrorInfo] 
      def self.internal_error(member:)
        new(member: member, discriminant: "internal_error")
      end
    end
  end
end