# frozen_string_literal: true

require_relative "deserialization_test_request"
require "date"
require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    # Response for deserialization test
    class DeserializationTestResponse
      # @return [SeedNullableOptionalClient::NullableOptional::DeserializationTestRequest]
      attr_reader :echo
      # @return [DateTime]
      attr_reader :processed_at
      # @return [Integer]
      attr_reader :null_count
      # @return [Integer]
      attr_reader :present_fields_count
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param echo [SeedNullableOptionalClient::NullableOptional::DeserializationTestRequest]
      # @param processed_at [DateTime]
      # @param null_count [Integer]
      # @param present_fields_count [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::DeserializationTestResponse]
      def initialize(echo:, processed_at:, null_count:, present_fields_count:, additional_properties: nil)
        @echo = echo
        @processed_at = processed_at
        @null_count = null_count
        @present_fields_count = present_fields_count
        @additional_properties = additional_properties
        @_field_set = {
          "echo": echo,
          "processedAt": processed_at,
          "nullCount": null_count,
          "presentFieldsCount": present_fields_count
        }
      end

      # Deserialize a JSON object to an instance of DeserializationTestResponse
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::DeserializationTestResponse]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        if parsed_json["echo"].nil?
          echo = nil
        else
          echo = parsed_json["echo"].to_json
          echo = SeedNullableOptionalClient::NullableOptional::DeserializationTestRequest.from_json(json_object: echo)
        end
        processed_at = (DateTime.parse(parsed_json["processedAt"]) unless parsed_json["processedAt"].nil?)
        null_count = parsed_json["nullCount"]
        present_fields_count = parsed_json["presentFieldsCount"]
        new(
          echo: echo,
          processed_at: processed_at,
          null_count: null_count,
          present_fields_count: present_fields_count,
          additional_properties: struct
        )
      end

      # Serialize an instance of DeserializationTestResponse to a JSON object
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
        SeedNullableOptionalClient::NullableOptional::DeserializationTestRequest.validate_raw(obj: obj.echo)
        obj.processed_at.is_a?(DateTime) != false || raise("Passed value for field obj.processed_at is not the expected type, validation failed.")
        obj.null_count.is_a?(Integer) != false || raise("Passed value for field obj.null_count is not the expected type, validation failed.")
        obj.present_fields_count.is_a?(Integer) != false || raise("Passed value for field obj.present_fields_count is not the expected type, validation failed.")
      end
    end
  end
end
