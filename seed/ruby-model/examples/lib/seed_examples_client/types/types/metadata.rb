# frozen_string_literal: true

require "set"
require "json"

module SeedExamplesClient
  module Types
    class Metadata
      attr_reader :member, :discriminant, :extra, :tags

      private_class_method :new
      alias kind_of? is_a?
      # @param member [Object]
      # @param discriminant [String]
      # @param extra [Hash{String => String}]
      # @param tags [Set<String>]
      # @return [Types::Metadata]
      def initialize(member:, discriminant:, extra:, tags:)
        # @type [Object]
        @member = member
        # @type [String]
        @discriminant = discriminant
        # @type [Hash{String => String}]
        @extra = extra
        # @type [Set<String>]
        @tags = tags
      end

      # Deserialize a JSON object to an instance of Metadata
      #
      # @param json_object [JSON]
      # @return [Types::Metadata]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "html"
                   json_object.value
                 when "markdown"
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
        when "html"
        when "markdown"
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
        when "html"
          obj.is_a?(String) != false || raise("Passed value for field obj is not the expected type, validation failed.")
        when "markdown"
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

      # @param member [String]
      # @return [Types::Metadata]
      def self.html(member:)
        new(member: member, discriminant: "html")
      end

      # @param member [String]
      # @return [Types::Metadata]
      def self.markdown(member:)
        new(member: member, discriminant: "markdown")
      end
    end
  end
end
