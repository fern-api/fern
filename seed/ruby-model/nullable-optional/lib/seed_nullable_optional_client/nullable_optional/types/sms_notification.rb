# frozen_string_literal: true

require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class SmsNotification
      # @return [String]
      attr_reader :phone_number
      # @return [String]
      attr_reader :message
      # @return [String]
      attr_reader :short_code
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param phone_number [String]
      # @param message [String]
      # @param short_code [String]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::SmsNotification]
      def initialize(phone_number:, message:, short_code: OMIT, additional_properties: nil)
        @phone_number = phone_number
        @message = message
        @short_code = short_code if short_code != OMIT
        @additional_properties = additional_properties
        @_field_set = { "phoneNumber": phone_number, "message": message, "shortCode": short_code }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of SmsNotification
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::SmsNotification]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        phone_number = parsed_json["phoneNumber"]
        message = parsed_json["message"]
        short_code = parsed_json["shortCode"]
        new(
          phone_number: phone_number,
          message: message,
          short_code: short_code,
          additional_properties: struct
        )
      end

      # Serialize an instance of SmsNotification to a JSON object
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
        obj.phone_number.is_a?(String) != false || raise("Passed value for field obj.phone_number is not the expected type, validation failed.")
        obj.message.is_a?(String) != false || raise("Passed value for field obj.message is not the expected type, validation failed.")
        obj.short_code&.is_a?(String) != false || raise("Passed value for field obj.short_code is not the expected type, validation failed.")
      end
    end
  end
end
