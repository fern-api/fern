# frozen_string_literal: true

require_relative "multiple_filter_search_request_operator"
require_relative "multiple_filter_search_request_value"
require "ostruct"
require "json"

module SeedPaginationClient
  class Complex
    class MultipleFilterSearchRequest
      # @return [SeedPaginationClient::Complex::MultipleFilterSearchRequestOperator]
      attr_reader :operator
      # @return [SeedPaginationClient::Complex::MultipleFilterSearchRequestValue]
      attr_reader :value
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param operator [SeedPaginationClient::Complex::MultipleFilterSearchRequestOperator]
      # @param value [SeedPaginationClient::Complex::MultipleFilterSearchRequestValue]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedPaginationClient::Complex::MultipleFilterSearchRequest]
      def initialize(operator: OMIT, value: OMIT, additional_properties: nil)
        @operator = operator if operator != OMIT
        @value = value if value != OMIT
        @additional_properties = additional_properties
        @_field_set = { "operator": operator, "value": value }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of MultipleFilterSearchRequest
      #
      # @param json_object [String]
      # @return [SeedPaginationClient::Complex::MultipleFilterSearchRequest]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        operator = parsed_json["operator"]
        if parsed_json["value"].nil?
          value = nil
        else
          value = parsed_json["value"].to_json
          value = SeedPaginationClient::Complex::MultipleFilterSearchRequestValue.from_json(json_object: value)
        end
        new(
          operator: operator,
          value: value,
          additional_properties: struct
        )
      end

      # Serialize an instance of MultipleFilterSearchRequest to a JSON object
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
        obj.operator&.is_a?(SeedPaginationClient::Complex::MultipleFilterSearchRequestOperator) != false || raise("Passed value for field obj.operator is not the expected type, validation failed.")
        obj.value.nil? || SeedPaginationClient::Complex::MultipleFilterSearchRequestValue.validate_raw(obj: obj.value)
      end
    end
  end
end
