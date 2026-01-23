# frozen_string_literal: true

module FernWebhookAudience
  module Types
    class PublicPayload < Internal::Types::Model
      field :message, -> { String }, optional: false, nullable: false
    end
  end
end
