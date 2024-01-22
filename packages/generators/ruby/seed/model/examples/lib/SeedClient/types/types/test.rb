# frozen_string_literal: true
require "json"

module SeedClient
  module Types
    class Test
      attr_reader :member, :discriminant
      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object] 
      # @param discriminant [String] 
      # @return [Types::Test] 
      def initialze(member:, discriminant:)
        # @type [Object] 
        @member = member
        # @type [String] 
        @discriminant = discriminant
      end
      # Deserialize a JSON object to an instance of Test
      #
      # @param json_object [JSON] 
      # @return [Types::Test] 
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        case struct.type
        when "and_"
          member = json_object.value
        when "or_"
          member = json_object.value
        else
          member = json_object
        end
        new(member: member, discriminant: struct.type)
      end
      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [] 
      def to_json
        case @discriminant
        when "and_"
          { type: @discriminant, value: @member }.to_json()
        when "or_"
          { type: @discriminant, value: @member }.to_json()
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
        when "and_"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "or_"
          obj.is_a?(Boolean) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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
      # @param member [Boolean] 
      # @return [Types::Test] 
      def self.and_(member:)
        new(member: member, discriminant: "and_")
      end
      # @param member [Boolean] 
      # @return [Types::Test] 
      def self.or_(member:)
        new(member: member, discriminant: "or_")
      end
    end
  end
end