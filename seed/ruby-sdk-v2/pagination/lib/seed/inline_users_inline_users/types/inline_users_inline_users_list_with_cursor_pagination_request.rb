# frozen_string_literal: true

module Seed
  module InlineUsersInlineUsers
    module Types
      class InlineUsersInlineUsersListWithCursorPaginationRequest < Internal::Types::Model
        field :page, -> { Integer }, optional: true, nullable: false
        field :per_page, -> { Integer }, optional: true, nullable: false
        field :order, -> { Seed::Types::InlineUsersOrder }, optional: true, nullable: false
        field :starting_after, -> { String }, optional: true, nullable: false
      end
    end
  end
end
