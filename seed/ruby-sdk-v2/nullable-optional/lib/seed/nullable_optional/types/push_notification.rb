# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class PushNotification < Internal::Types::Model
        field :device_token, -> { String }, optional: false, nullable: false, api_name: "deviceToken"
        field :title, -> { String }, optional: false, nullable: false
        field :body, -> { String }, optional: false, nullable: false
        field :badge, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
