# frozen_string_literal: true

require "json"
require_relative "exception_info"

module SeedExamplesClient
  module Types
    class Exception
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Types::Exception]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of Exception
      #
      # @param json_object [JSON]
      # @return [Types::Exception]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "generic"
                   Types::ExceptionInfo.from_json(json_object: json_object)
                 when "timeout"
                   nil
                 else
                   Types::ExceptionInfo.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "generic"
          { **@member.to_json, type: @discriminant }.to_json
        when "timeout"
          { type: @discriminant }.to_json
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
        when "generic"
          Types::ExceptionInfo.validate_raw(obj: obj)
        when "timeout"
          # noop
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

      # @param member [Types::ExceptionInfo]
      # @return [Types::Exception]
      def self.generic(member:)
        new(member: member, discriminant: "generic")
      end

      # @return [Types::Exception]
      def self.timeout
        new(member: nil, discriminant: "timeout")
      end
    end
  end
end
