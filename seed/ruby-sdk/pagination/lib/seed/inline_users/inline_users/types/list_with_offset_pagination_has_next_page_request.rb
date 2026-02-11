# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class ListWithOffsetPaginationHasNextPageRequest < Internal::Types::Model
          field :page, -> { Integer }, optional: true, nullable: false
          field :limit, -> { Integer }, optional: true, nullable: false
          field :order, -> { Seed::InlineUsers::InlineUsers::Types::Order }, optional: true, nullable: false
        end
      end
    end
  end
end
