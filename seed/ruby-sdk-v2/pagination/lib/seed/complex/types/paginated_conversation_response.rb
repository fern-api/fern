# frozen_string_literal: true

module Seed
  module Complex
    module Types
      class PaginatedConversationResponse < Internal::Types::Model
        field :conversations, lambda {
          Internal::Types::Array[Seed::Complex::Types::Conversation]
        }, optional: false, nullable: false
        field :pages, -> { Seed::Complex::Types::CursorPages }, optional: true, nullable: false
        field :total_count, -> { Integer }, optional: false, nullable: false
        field :type, -> { String }, optional: false, nullable: false
      end
    end
  end
end
