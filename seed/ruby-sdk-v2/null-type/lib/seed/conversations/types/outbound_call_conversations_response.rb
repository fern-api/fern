# frozen_string_literal: true

module Seed
  module Conversations
    module Types
      class OutboundCallConversationsResponse < Internal::Types::Model
        field :conversation_id, -> { Object }, optional: false, nullable: true
        field :dry_run, -> { Internal::Types::Boolean }, optional: false, nullable: false
      end
    end
  end
end
