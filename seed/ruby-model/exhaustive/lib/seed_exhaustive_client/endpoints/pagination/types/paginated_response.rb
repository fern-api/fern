# frozen_string_literal: true

require_relative "../../../types/object/types/object_with_required_field"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Endpoints
    class Pagination
      class PaginatedResponse
        # @return [Array<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
        attr_reader :items
        # @return [String]
        attr_reader :next_
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param items [Array<SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField>]
        # @param next_ [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Endpoints::Pagination::PaginatedResponse]
        def initialize(items:, next_: OMIT, additional_properties: nil)
          @items = items
          @next_ = next_ if next_ != OMIT
          @additional_properties = additional_properties
          @_field_set = { "items": items, "next": next_ }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of PaginatedResponse
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Endpoints::Pagination::PaginatedResponse]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          items = parsed_json["items"]&.map do |item|
            item = item.to_json
            SeedExhaustiveClient::Types::Object_::ObjectWithRequiredField.from_json(json_object: item)
          end
          next_ = parsed_json["next"]
          new(
            items: items,
            next_: next_,
            additional_properties: struct
          )
        end

        # Serialize an instance of PaginatedResponse to a JSON object
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
          obj.items.is_a?(Array) != false || raise("Passed value for field obj.items is not the expected type, validation failed.")
          obj.next_&.is_a?(String) != false || raise("Passed value for field obj.next_ is not the expected type, validation failed.")
        end
      end
    end
  end
end
