# frozen_string_literal: true

module Seed
  module Conversations
    module Types
      class OutboundCallConversationsRequest < Internal::Types::Model
        field :to_phone_number, -> { String }, optional: false, nullable: false

        field :dry_run, -> { Internal::Types::Boolean }, optional: true, nullable: false
      end
    end
  end
end
