# frozen_string_literal: true

module Seed
  module InlineUsersInlineUsers
    module Types
      class InlineUsersInlineUsersListWithOffsetPaginationHasNextPageRequest < Internal::Types::Model
        field :page, -> { Integer }, optional: true, nullable: false
        field :limit, -> { Integer }, optional: true, nullable: false
        field :order, -> { Seed::Types::InlineUsersOrder }, optional: true, nullable: false
      end
    end
  end
end
