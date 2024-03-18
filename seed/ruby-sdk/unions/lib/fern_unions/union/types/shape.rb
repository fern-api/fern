# frozen_string_literal: true

require "json"
require_relative "circle"
require_relative "square"

module SeedUnionsClient
  class Union
    class Shape
      attr_reader :member, :discriminant, :id

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @param id [String]
      # @return [Union::Shape]
      def initialize(member:, discriminant:, id:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
        # @type [String]
        @id = id
      end

      # Deserialize a JSON object to an instance of Shape
      #
      # @param json_object [JSON]
      # @return [Union::Shape]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "circle"
                   Union::Circle.from_json(json_object: json_object)
                 when "square"
                   Union::Square.from_json(json_object: json_object)
                 else
                   Union::Circle.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [JSON]
      def to_json(*_args)
        case @discriminant
        when "circle"
          { **@member.to_json, type: @discriminant }.to_json
        when "square"
          { **@member.to_json, type: @discriminant }.to_json
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
        when "circle"
          Union::Circle.validate_raw(obj: obj)
        when "square"
          Union::Square.validate_raw(obj: obj)
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

      # @param member [Union::Circle]
      # @return [Union::Shape]
      def self.circle(member:)
        new(member: member, discriminant: "circle")
      end

      # @param member [Union::Square]
      # @return [Union::Shape]
      def self.square(member:)
        new(member: member, discriminant: "square")
      end
    end
  end
end
