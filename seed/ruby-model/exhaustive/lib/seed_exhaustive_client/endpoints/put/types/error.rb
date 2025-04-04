# frozen_string_literal: true

require_relative "error_category"
require_relative "error_code"
require "ostruct"
require "json"

module SeedExhaustiveClient
  module Endpoints
    class Put
      class Error
        # @return [SeedExhaustiveClient::Endpoints::Put::ErrorCategory]
        attr_reader :category
        # @return [SeedExhaustiveClient::Endpoints::Put::ErrorCode]
        attr_reader :code
        # @return [String]
        attr_reader :detail
        # @return [String]
        attr_reader :field
        # @return [OpenStruct] Additional properties unmapped to the current class definition
        attr_reader :additional_properties
        # @return [Object]
        attr_reader :_field_set
        protected :_field_set

        OMIT = Object.new

        # @param category [SeedExhaustiveClient::Endpoints::Put::ErrorCategory]
        # @param code [SeedExhaustiveClient::Endpoints::Put::ErrorCode]
        # @param detail [String]
        # @param field [String]
        # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
        # @return [SeedExhaustiveClient::Endpoints::Put::Error]
        def initialize(category:, code:, detail: OMIT, field: OMIT, additional_properties: nil)
          @category = category
          @code = code
          @detail = detail if detail != OMIT
          @field = field if field != OMIT
          @additional_properties = additional_properties
          @_field_set = { "category": category, "code": code, "detail": detail, "field": field }.reject do |_k, v|
            v == OMIT
          end
        end

        # Deserialize a JSON object to an instance of Error
        #
        # @param json_object [String]
        # @return [SeedExhaustiveClient::Endpoints::Put::Error]
        def self.from_json(json_object:)
          struct = JSON.parse(json_object, object_class: OpenStruct)
          parsed_json = JSON.parse(json_object)
          category = parsed_json["category"]
          code = parsed_json["code"]
          detail = parsed_json["detail"]
          field = parsed_json["field"]
          new(
            category: category,
            code: code,
            detail: detail,
            field: field,
            additional_properties: struct
          )
        end

        # Serialize an instance of Error to a JSON object
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
          obj.category.is_a?(SeedExhaustiveClient::Endpoints::Put::ErrorCategory) != false || raise("Passed value for field obj.category is not the expected type, validation failed.")
          obj.code.is_a?(SeedExhaustiveClient::Endpoints::Put::ErrorCode) != false || raise("Passed value for field obj.code is not the expected type, validation failed.")
          obj.detail&.is_a?(String) != false || raise("Passed value for field obj.detail is not the expected type, validation failed.")
          obj.field&.is_a?(String) != false || raise("Passed value for field obj.field is not the expected type, validation failed.")
        end
      end
    end
  end
end
