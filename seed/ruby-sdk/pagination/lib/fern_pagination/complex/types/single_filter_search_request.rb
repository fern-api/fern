# frozen_string_literal: true

require_relative "single_filter_search_request_operator"
require "ostruct"
require "json"

module SeedPaginationClient
  class Complex
    class SingleFilterSearchRequest
      # @return [String]
      attr_reader :field
      # @return [SeedPaginationClient::Complex::SingleFilterSearchRequestOperator]
      attr_reader :operator
      # @return [String]
      attr_reader :value
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param field [String]
      # @param operator [SeedPaginationClient::Complex::SingleFilterSearchRequestOperator]
      # @param value [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Complex::SingleFilterSearchRequest]
      def initialize(field: OMIT, operator: OMIT, value: OMIT, additional_properties: nil)
        @field = field if field != OMIT
        @operator = operator if operator != OMIT
        @value = value if value != OMIT
        @additional_properties = additional_properties
        @_field_set = { "field": field, "operator": operator, "value": value }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SingleFilterSearchRequest
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::SingleFilterSearchRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        field = parsed_json["field"]
        operator = parsed_json["operator"]
        value = parsed_json["value"]
        new(
          field: field,
          operator: operator,
          value: value,
          additional_properties: struct
        )
      end

      # Serialize an instance of SingleFilterSearchRequest to a JSON object
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
        obj.field&.is_a?(String) != false || raise("Passed value for field obj.field is not the expected type, validation failed.")
        obj.operator&.is_a?(SeedPaginationClient::Complex::SingleFilterSearchRequestOperator) != false || raise("Passed value for field obj.operator is not the expected type, validation failed.")
        obj.value&.is_a?(String) != false || raise("Passed value for field obj.value is not the expected type, validation failed.")
      end
    end
  end
end
