# frozen_string_literal: true

require "json"
require "date"

module SeedUnionsClient
  class Types
    class UnionWithTime
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedUnionsClient::Types::UnionWithTime]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of UnionWithTime
      #
      # @param json_object [String]
      # @return [SeedUnionsClient::Types::UnionWithTime]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "value"
                   json_object.value
                 when "date"
                   Date.parse(json_object.value) unless json_object.value.nil?
                 when "datetime"
                   DateTime.parse(json_object.value) unless json_object.value.nil?
                 else
                   json_object
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "value"
        when "date"
        when "datetime"
        end
        { "type": @discriminant, "value": @member }.to_json
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
        when "value"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "date"
          obj.is_a?(Date) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "datetime"
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

      # @param member [Integer]
      # @return [SeedUnionsClient::Types::UnionWithTime]
      def self.value(member:)
        new(member: member, discriminant: "value")
      end

      # @param member [Date]
      # @return [SeedUnionsClient::Types::UnionWithTime]
      def self.date(member:)
        new(member: member, discriminant: "date")
      end

      # @param member [DateTime]
      # @return [SeedUnionsClient::Types::UnionWithTime]
      def self.datetime(member:)
        new(member: member, discriminant: "datetime")
      end
    end
  end
end
