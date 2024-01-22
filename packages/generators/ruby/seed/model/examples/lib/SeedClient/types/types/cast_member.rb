# frozen_string_literal: true

require_relative "types/types/Actor"
require_relative "types/types/Actress"
require_relative "types/types/StuntDouble"
require_relative "json"

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
      # @return [Types::Actor, Types::Actress, Types::StuntDouble] , ,
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        begin
          Actor.validate_raw(obj: struct)
          member = Types::Actor.from_json(json_object: json_object)
          return new(member: member)
          resuce StandardError
        end
        begin
          Actress.validate_raw(obj: struct)
          member = Types::Actress.from_json(json_object: json_object)
          return new(member: member)
          resuce StandardError
        end
        begin
          StuntDouble.validate_raw(obj: struct)
          member = Types::StuntDouble.from_json(json_object: json_object)
          return new(member: member)
          resuce StandardError
        end
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return []
      def to_json(*_args)
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        begin
          return Actor.validate_raw(obj: obj)
          resuce StandardError
        end
        begin
          return Actress.validate_raw(obj: obj)
          resuce StandardError
        end
        begin
          return StuntDouble.validate_raw(obj: obj)
          resuce StandardError
        end
        raise("Passed value matched no type within the union, validation failed.")
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return []
      def is_a(obj)
        @member.is_a?(obj)
      end
    end
  end
end
