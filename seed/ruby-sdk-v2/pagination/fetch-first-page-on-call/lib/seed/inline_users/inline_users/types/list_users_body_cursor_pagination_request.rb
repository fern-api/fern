# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersBodyCursorPaginationRequest < Internal::Types::Model
          field :pagination, -> { Seed::InlineUsers::InlineUsers::Types::WithCursor }, optional: true, nullable: false
        end
      end
    end
  end
end
