# frozen_string_literal: true

require "json"
require_relative "inline_type_1"
require_relative "inline_type_2"

module SeedObjectClient
  class InlinedDiscriminatedUnion1
    # @return [Object]
    attr_reader :member
    # @return [String]
    attr_reader :discriminant

    private_class_method :new
    alias kind_of? is_a?

    # @param member [Object]
    # @param discriminant [String]
    # @return [SeedObjectClient::InlinedDiscriminatedUnion1]
    def initialize(member:, discriminant:)
      @member = member
      @discriminant = discriminant
    end

    # Deserialize a JSON object to an instance of InlinedDiscriminatedUnion1
    #
    # @param json_object [String]
    # @return [SeedObjectClient::InlinedDiscriminatedUnion1]
    def self.from_json(json_object:)
      struct = JSON.parse(json_object, object_class: OpenStruct)
      member = case struct.type
               when "type1"
                 SeedObjectClient::InlineType1.from_json(json_object: json_object)
               when "type2"
                 SeedObjectClient::InlineType2.from_json(json_object: json_object)
               else
                 SeedObjectClient::InlineType1.from_json(json_object: json_object)
               end
      new(member: member, discriminant: struct.type)
    end

    # For Union Types, to_json functionality is delegated to the wrapped member.
    #
    # @return [String]
    def to_json(*_args)
      case @discriminant
      when "type1"
        { **@member.to_json, type: @discriminant }.to_json
      when "type2"
        { **@member.to_json, type: @discriminant }.to_json
      else
        { "type": @discriminant, value: @member }.to_json
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
      case obj.type
      when "type1"
        SeedObjectClient::InlineType1.validate_raw(obj: obj)
      when "type2"
        SeedObjectClient::InlineType2.validate_raw(obj: obj)
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

    # @param member [SeedObjectClient::InlineType1]
    # @return [SeedObjectClient::InlinedDiscriminatedUnion1]
    def self.type_1(member:)
      new(member: member, discriminant: "type1")
    end

    # @param member [SeedObjectClient::InlineType2]
    # @return [SeedObjectClient::InlinedDiscriminatedUnion1]
    def self.type_2(member:)
      new(member: member, discriminant: "type2")
    end
  end
end
