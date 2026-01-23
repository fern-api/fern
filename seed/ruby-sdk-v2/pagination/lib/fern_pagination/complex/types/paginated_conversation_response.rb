# frozen_string_literal: true

module FernPagination
  module Complex
    module Types
      class PaginatedConversationResponse < Internal::Types::Model
        field :conversations, -> { Internal::Types::Array[FernPagination::Complex::Types::Conversation] }, optional: false, nullable: false
        field :pages, -> { FernPagination::Complex::Types::CursorPages }, optional: true, nullable: false
        field :total_count, -> { Integer }, optional: false, nullable: false
        field :type, -> { String }, optional: false, nullable: false
      end
    end
  end
end
