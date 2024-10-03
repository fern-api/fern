# frozen_string_literal: true

require_relative "my_union"
require "ostruct"
require "json"

module SeedUndiscriminatedUnionsClient
  class Union
    class TypeWithOptionalUnion
      # @return [SeedUndiscriminatedUnionsClient::Union::MyUnion]
      attr_reader :my_union
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param my_union [SeedUndiscriminatedUnionsClient::Union::MyUnion]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUndiscriminatedUnionsClient::Union::TypeWithOptionalUnion]
      def initialize(my_union: OMIT, additional_properties: nil)
        @my_union = my_union if my_union != OMIT
        @additional_properties = additional_properties
        @_field_set = { "myUnion": my_union }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of TypeWithOptionalUnion
      #
      # @param json_object [String]
      # @return [SeedUndiscriminatedUnionsClient::Union::TypeWithOptionalUnion]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["myUnion"].nil?
          my_union = nil
        else
          my_union = parsed_json["myUnion"].to_json
          my_union = SeedUndiscriminatedUnionsClient::Union::MyUnion.from_json(json_object: my_union)
        end
        new(my_union: my_union, additional_properties: struct)
      end

      # Serialize an instance of TypeWithOptionalUnion to a JSON object
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
        obj.my_union.nil? || SeedUndiscriminatedUnionsClient::Union::MyUnion.validate_raw(obj: obj.my_union)
      end
    end
  end
end
