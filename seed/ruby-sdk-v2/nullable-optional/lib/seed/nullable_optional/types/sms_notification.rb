# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class SmsNotification < Internal::Types::Model
        field :phone_number, -> { String }, optional: false, nullable: false, api_name: "phoneNumber"
        field :message, -> { String }, optional: false, nullable: false
        field :short_code, -> { String }, optional: true, nullable: false, api_name: "shortCode"
      end
    end
  end
end
