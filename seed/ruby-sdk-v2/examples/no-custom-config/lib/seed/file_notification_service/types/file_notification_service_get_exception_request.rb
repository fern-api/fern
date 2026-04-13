# frozen_string_literal: true

module Seed
  module FileNotificationService
    module Types
      class FileNotificationServiceGetExceptionRequest < Internal::Types::Model
        field :notification_id, -> { String }, optional: false, nullable: false, api_name: "notificationId"
      end
    end
  end
end
