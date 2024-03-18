# frozen_string_literal: true

require "json"
require "date"

module SeedUnionsClient
  class Types
    class UnionWithOptionalTime
      attr_reader :member, :discriminant

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @return [Types::UnionWithOptionalTime]
      def initialize(member:, discriminant:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of UnionWithOptionalTime
      #
      # @param json_object [JSON]
      # @return [Types::UnionWithOptionalTime]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "date"
                   Date.parse(json_object.value) unless json_object.value.nil?
                 when "dateimte"
                   DateTime.parse(json_object.value) unless json_object.value.nil?
                 else
                   Date.parse(json_object) unless json_object.nil?
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "date"
        when "dateimte"
        end
        { "type": @discriminant, "value": @member }.to_json
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given hash and check each fields type against the current object's property definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "date"
          obj.is_a?(Date) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "dateimte"
          obj.is_a?(DateTime) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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

      # @param member [Date]
      # @return [Types::UnionWithOptionalTime]
      def self.date(member:)
        new(member: member, discriminant: "date")
      end

      # @param member [DateTime]
      # @return [Types::UnionWithOptionalTime]
      def self.dateimte(member:)
        new(member: member, discriminant: "dateimte")
      end
    end
  end
end
