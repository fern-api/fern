# frozen_string_literal: true

require "json"
require_relative "generic_create_problem_error"

module SeedTraceClient
  class Problem
    class CreateProblemError
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedTraceClient::Problem::CreateProblemError]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of CreateProblemError
      #
      # @param json_object [String]
      # @return [SeedTraceClient::Problem::CreateProblemError]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct._type
        when "generic"
        end
        member = SeedTraceClient::Problem::GenericCreateProblemError.from_json(json_object: json_object)
        new(member: member, discriminant: struct._type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "generic"
          { **@member.to_json, _type: @discriminant }.to_json
        else
          { "_type": @discriminant, value: @member }.to_json
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
        case obj._type
        when "generic"
          SeedTraceClient::Problem::GenericCreateProblemError.validate_raw(obj: obj)
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

      # @param member [SeedTraceClient::Problem::GenericCreateProblemError]
      # @return [SeedTraceClient::Problem::CreateProblemError]
      def self.generic(member:)
        new(member: member, discriminant: "generic")
      end
    end
  end
end
