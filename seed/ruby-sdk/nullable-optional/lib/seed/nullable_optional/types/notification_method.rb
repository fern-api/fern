# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      # Discriminated union for testing nullable unions
      class NotificationMethod < Internal::Types::Model
        extend Seed::Internal::Types::Union

        discriminant :type

        member -> { Seed::NullableOptional::Types::EmailNotification }, key: "EMAIL"
        member -> { Seed::NullableOptional::Types::SmsNotification }, key: "SMS"
        member -> { Seed::NullableOptional::Types::PushNotification }, key: "PUSH"
      end
    end
  end
end
