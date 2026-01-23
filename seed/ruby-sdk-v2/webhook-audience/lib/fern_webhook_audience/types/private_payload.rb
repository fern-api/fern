# frozen_string_literal: true

module FernWebhookAudience
  module Types
    class PrivatePayload < Internal::Types::Model
      field :secret, -> { String }, optional: false, nullable: false
    end
  end
end
