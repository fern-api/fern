# frozen_string_literal: true

require "json"
require_relative "generic_create_problem_error"

module SeedTraceClient
  module Problem
    class CreateProblemError
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Problem::CreateProblemError]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of CreateProblemError
      #
      # @param json_object [JSON]
      # @return [Problem::CreateProblemError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct._type
                 when "generic"
                 end
        Problem::GenericCreateProblemError.from_json(json_object: json_object)
        new(member: member, discriminant: struct._type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "generic"
          { _type: @discriminant, **@member.to_json }.to_json
        else
          { "_type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj._type
        when "generic"
          Problem::GenericCreateProblemError.validate_raw(obj: obj)
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

      # @param member [Problem::GenericCreateProblemError]
      # @return [Problem::CreateProblemError]
      def self.generic(member:)
        new(member: member, discriminant: "generic")
      end
    end
  end
end
