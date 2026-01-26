# frozen_string_literal: true

module FernNullableOptional
  module NullableOptional
    module Types
      # Discriminated union for testing nullable unions
      class NotificationMethod < Internal::Types::Model
        extend FernNullableOptional::Internal::Types::Union

        discriminant :type

        member -> { FernNullableOptional::NullableOptional::Types::EmailNotification }, key: "EMAIL"
        member -> { FernNullableOptional::NullableOptional::Types::SmsNotification }, key: "SMS"
        member -> { FernNullableOptional::NullableOptional::Types::PushNotification }, key: "PUSH"
      end
    end
  end
end
