# frozen_string_literal: true

require_relative "metadata_union"
require "ostruct"
require "json"

module SeedUndiscriminatedUnionsClient
  class Union
    class Request
      # @return [SeedUndiscriminatedUnionsClient::Union::MetadataUnion]
      attr_reader :union
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param union [SeedUndiscriminatedUnionsClient::Union::MetadataUnion]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedUndiscriminatedUnionsClient::Union::Request]
      def initialize(union: OMIT, additional_properties: nil)
        @union = union if union != OMIT
        @additional_properties = additional_properties
        @_field_set = { "union": union }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of Request
      #
      # @param json_object [String]
      # @return [SeedUndiscriminatedUnionsClient::Union::Request]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["union"].nil?
          union = nil
        else
          union = parsed_json["union"].to_json
          union = SeedUndiscriminatedUnionsClient::Union::MetadataUnion.from_json(json_object: union)
        end
        new(union: union, additional_properties: struct)
      end

      # Serialize an instance of Request to a JSON object
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
        obj.union.nil? || SeedUndiscriminatedUnionsClient::Union::MetadataUnion.validate_raw(obj: obj.union)
      end
    end
  end
end
