# frozen_string_literal: true

require "json"
require_relative "email_notification"
require_relative "sms_notification"
require_relative "push_notification"

module SeedNullableOptionalClient
  class NullableOptional
    # Discriminated union for testing nullable unions
    class NotificationMethod
      # @return [Object]
      attr_reader :member
      # @return [String]
      attr_reader :discriminant

      private_class_method :new
      alias kind_of? is_a?

      # @param member [Object]
      # @param discriminant [String]
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      def initialize(member:, discriminant:)
        @member = member
        @discriminant = discriminant
      end

      # Deserialize a JSON object to an instance of NotificationMethod
      #
      # @param json_object [String]
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      def self.from_json(json_object:)
        struct = JSON.parse(json_object, object_class: OpenStruct)
        member = case struct.type
                 when "email"
                   SeedNullableOptionalClient::NullableOptional::EmailNotification.from_json(json_object: json_object)
                 when "sms"
                   SeedNullableOptionalClient::NullableOptional::SmsNotification.from_json(json_object: json_object)
                 when "push"
                   SeedNullableOptionalClient::NullableOptional::PushNotification.from_json(json_object: json_object)
                 else
                   SeedNullableOptionalClient::NullableOptional::EmailNotification.from_json(json_object: json_object)
                 end
        new(member: member, discriminant: struct.type)
      end

      # For Union Types, to_json functionality is delegated to the wrapped member.
      #
      # @return [String]
      def to_json(*_args)
        case @discriminant
        when "email"
          { **@member.to_json, type: @discriminant }.to_json
        when "sms"
          { **@member.to_json, type: @discriminant }.to_json
        when "push"
          { **@member.to_json, type: @discriminant }.to_json
        else
          { "type": @discriminant, value: @member }.to_json
        end
        @member.to_json
      end

      # Leveraged for Union-type generation, validate_raw attempts to parse the given
      #  hash and check each fields type against the current object's property
      #  definitions.
      #
      # @param obj [Object]
      # @return [Void]
      def self.validate_raw(obj:)
        case obj.type
        when "email"
          SeedNullableOptionalClient::NullableOptional::EmailNotification.validate_raw(obj: obj)
        when "sms"
          SeedNullableOptionalClient::NullableOptional::SmsNotification.validate_raw(obj: obj)
        when "push"
          SeedNullableOptionalClient::NullableOptional::PushNotification.validate_raw(obj: obj)
        else
          raise("Passed value matched no type within the union, validation failed.")
        end
      end

      # For Union Types, is_a? functionality is delegated to the wrapped member.
      #
      # @param obj [Object]
      # @return [Boolean]
      def is_a?(obj)
        @member.is_a?(obj)
      end

      # @param member [SeedNullableOptionalClient::NullableOptional::EmailNotification]
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      def self.email(member:)
        new(member: member, discriminant: "email")
      end

      # @param member [SeedNullableOptionalClient::NullableOptional::SmsNotification]
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      def self.sms(member:)
        new(member: member, discriminant: "sms")
      end

      # @param member [SeedNullableOptionalClient::NullableOptional::PushNotification]
      # @return [SeedNullableOptionalClient::NullableOptional::NotificationMethod]
      def self.push(member:)
        new(member: member, discriminant: "push")
      end
    end
  end
end
