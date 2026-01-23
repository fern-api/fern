# frozen_string_literal: true

module FernWebhookAudience
  module Types
    class NoAudiencePayload < Internal::Types::Model
      field :data, -> { String }, optional: false, nullable: false
    end
  end
end
