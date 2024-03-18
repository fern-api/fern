# frozen_string_literal: true

require "json"

module SeedUnionsClient
  class Types
    class UnionWithBaseProperties
      attr_reader :member, :discriminant, :id

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @param id [String]
      # @return [Types::UnionWithBaseProperties]
      def initialize(member:, discriminant:, id:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
        # @type [String]
        @id = id
      end

      # Deserialize a JSON object to an instance of UnionWithBaseProperties
      #
      # @param json_object [JSON]
      # @return [Types::UnionWithBaseProperties]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "integer"
                   json_object.value
                 when "string"
                   json_object.value
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
        when "integer"
        when "string"
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
        when "integer"
          obj.is_a?(Integer) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "string"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
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
      # @return [Types::UnionWithBaseProperties]
      def self.integer(member:)
        new(member: member, discriminant: "integer")
      end

      # @param member [String]
      # @return [Types::UnionWithBaseProperties]
      def self.string(member:)
        new(member: member, discriminant: "string")
      end
    end
  end
end
