# frozen_string_literal: true

require "ostruct"
require "json"

module SeedNullableOptionalClient
  class NullableOptional
    class PushNotification
      # @return [String]
      attr_reader :device_token
      # @return [String]
      attr_reader :title
      # @return [String]
      attr_reader :body
      # @return [Integer]
      attr_reader :badge
      # @return [OpenStruct] Additional properties unmapped to the current class definition
      attr_reader :additional_properties
      # @return [Object]
      attr_reader :_field_set
      protected :_field_set

      OMIT = Object.new

      # @param device_token [String]
      # @param title [String]
      # @param body [String]
      # @param badge [Integer]
      # @param additional_properties [OpenStruct] Additional properties unmapped to the current class definition
      # @return [SeedNullableOptionalClient::NullableOptional::PushNotification]
      def initialize(device_token:, title:, body:, badge: OMIT, additional_properties: nil)
        @device_token = device_token
        @title = title
        @body = body
        @badge = badge if badge != OMIT
        @additional_properties = additional_properties
        @_field_set = { "deviceToken": device_token, "title": title, "body": body, "badge": badge }.reject do |_k, v|
          v == OMIT
        end
      end

      # Deserialize a JSON object to an instance of PushNotification
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::PushNotification]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        parsed_json = JSON.parse(json_object)
        device_token = parsed_json["deviceToken"]
        title = parsed_json["title"]
        body = parsed_json["body"]
        badge = parsed_json["badge"]
        new(
          device_token: device_token,
          title: title,
          body: body,
          badge: badge,
          additional_properties: struct
        )
      end

      # Serialize an instance of PushNotification to a JSON object
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
        obj.device_token.is_a?(String) != false || raise("Passed value for field obj.device_token is not the expected type, validation failed.")
        obj.title.is_a?(String) != false || raise("Passed value for field obj.title is not the expected type, validation failed.")
        obj.body.is_a?(String) != false || raise("Passed value for field obj.body is not the expected type, validation failed.")
        obj.badge&.is_a?(Integer) != false || raise("Passed value for field obj.badge is not the expected type, validation failed.")
      end
    end
  end
end
