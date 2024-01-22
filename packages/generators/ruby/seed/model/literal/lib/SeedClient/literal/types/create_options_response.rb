# frozen_string_literal: true

require_relative "json"
require_relative "literal/types/Options"

module SeedClient
  module Literal
    class CreateOptionsResponse
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Literal::CreateOptionsResponse]
      def initialze(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of CreateOptionsResponse
      #
      # @param json_object [JSON]
      # @return [Literal::CreateOptionsResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "ok"
                   json_object.value
                 when "options"
                   Literal::Options.from_json(json_object: json_object)
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "ok"
          { "type": @discriminant, "value": @member }.to_json
        when "options"
          { type: @discriminant, **@member.to_json }.to_json
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
        when "ok"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "options"
          Literal::Options.validate_raw(obj: obj)
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

      # @param member [Boolean]
      # @return [Literal::CreateOptionsResponse]
      def self.ok(member:)
        new(member: member, discriminant: "ok")
      end

      # @param member [Literal::Options]
      # @return [Literal::CreateOptionsResponse]
      def self.options(member:)
        new(member: member, discriminant: "options")
      end
    end
  end
end
