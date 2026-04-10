# frozen_string_literal: true

module Seed
  module InlineUsersInlineUsers
    module Types
      class InlineUsersInlineUsersListWithBodyCursorPaginationRequest < Internal::Types::Model
        field :pagination, -> { Seed::Types::InlineUsersWithCursor }, optional: true, nullable: false
      end
    end
  end
end
