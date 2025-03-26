# frozen_string_literal: true

require_relative "first_union"
require "ostruct"
require "json"

module SeedApiClient
  class Ast
    class SecondUnionFirstElement
      # @return [SeedApiClient::Ast::FirstUnion]
      attr_reader :child
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param child [SeedApiClient::Ast::FirstUnion]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedApiClient::Ast::SecondUnionFirstElement]
      def initialize(child:, additional_properties: nil)
        @child = child
        @additional_properties = additional_properties
        @_field_set = { "child": child }
      end

      # Deserialize a JSON object to an instance of SecondUnionFirstElement
      #
      # @param json_object [String]
      # @return [SeedApiClient::Ast::SecondUnionFirstElement]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["child"].nil?
          child = nil
        else
          child = parsed_json["child"].to_json
          child = SeedApiClient::Ast::FirstUnion.from_json(json_object: child)
        end
        new(child: child, additional_properties: struct)
      end

      # Serialize an instance of SecondUnionFirstElement to a JSON object
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
        SeedApiClient::Ast::FirstUnion.validate_raw(obj: obj.child)
      end
    end
  end
end
