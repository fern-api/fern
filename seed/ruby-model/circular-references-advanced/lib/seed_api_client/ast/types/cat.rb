# frozen_string_literal: true

require_relative "fruit"
require "ostruct"
require "json"

module SeedApiClient
  class Ast
    class Cat
      # @return [SeedApiClient::Ast::Fruit]
      attr_reader :fruit
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param fruit [SeedApiClient::Ast::Fruit]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedApiClient::Ast::Cat]
      def initialize(fruit:, additional_properties: nil)
        @fruit = fruit
        @additional_properties = additional_properties
        @_field_set = { "fruit": fruit }
      end

      # Deserialize a JSON object to an instance of Cat
      #
      # @param json_object [String]
      # @return [SeedApiClient::Ast::Cat]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["fruit"].nil?
          fruit = nil
        else
          fruit = parsed_json["fruit"].to_json
          fruit = SeedApiClient::Ast::Fruit.from_json(json_object: fruit)
        end
        new(fruit: fruit, additional_properties: struct)
      end

      # Serialize an instance of Cat to a JSON object
      #
      # @return [String]
      def to_json(*_args)
        @_field_set&.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        SeedApiClient::Ast::Fruit.validate_raw(obj: obj.fruit)
      end
    end
  end
end
