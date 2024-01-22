# frozen_string_literal: true

require_relative "json"
require_relative "types/types/Actor"
require_relative "types/types/Actress"
require_relative "types/types/StuntDouble"

module SeedClient
  module Types
    class CastMember
      attr_reader :member
      alias kind_of? is_a?
      # @param member [Object]
      # @return [Types::CastMember]
      def initialze(member:)
        # @type [Object]
        @member = member
      end

      # Deserialize a JSON object to an instance of CastMember
      #
      # @param json_object [JSON]
      # @return [Types::CastMember]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          Types::Actor.validate_raw(obj: struct)
          member = Types::Actor.from_json(json_object: json_object)
          return new(member: member)
        rescue StandardError
          # noop
        end
        begin
          Types::Actress.validate_raw(obj: struct)
          member = Types::Actress.from_json(json_object: json_object)
          return new(member: member)
        rescue StandardError
          # noop
        end
        begin
          Types::StuntDouble.validate_raw(obj: struct)
          member = Types::StuntDouble.from_json(json_object: json_object)
          new(member: member)
        rescue StandardError
          # noop
        end
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return Types::Actor.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return Types::Actress.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        begin
          return Types::StuntDouble.validate_raw(obj: obj)
        rescue StandardError
          # noop
        end
        raise("Passed value matched no type within the union, validation failed.")
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end
    end
  end
end
