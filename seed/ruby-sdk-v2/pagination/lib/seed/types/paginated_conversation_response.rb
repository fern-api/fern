# frozen_string_literal: true

module Seed
  module Types
    class PaginatedConversationResponse < Internal::Types::Model
      field :conversations, -> { Internal::Types::Array[Seed::Types::Conversation] }, optional: false, nullable: false
      field :pages, -> { Seed::Types::CursorPages }, optional: true, nullable: false
      field :total_count, -> { Integer }, optional: false, nullable: false
      field :type, -> { Seed::Types::PaginatedConversationResponseType }, optional: false, nullable: false
    end
  end
end
