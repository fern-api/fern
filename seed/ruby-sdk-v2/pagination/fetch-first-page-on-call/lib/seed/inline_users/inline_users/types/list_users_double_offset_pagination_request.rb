# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersDoubleOffsetPaginationRequest < Internal::Types::Model
          field :page, -> { Float }, optional: true, nullable: false

          field :per_page, -> { Float }, optional: true, nullable: false

          field :order, -> { Seed::InlineUsers::InlineUsers::Types::Order }, optional: true, nullable: false

          field :starting_after, -> { String }, optional: true, nullable: false
        end
      end
    end
  end
end
