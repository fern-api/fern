# frozen_string_literal: true

module FernPagination
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersOffsetStepPaginationRequest < Internal::Types::Model
          field :page, -> { Integer }, optional: true, nullable: false
          field :limit, -> { Integer }, optional: true, nullable: false
          field :order, -> { FernPagination::InlineUsers::InlineUsers::Types::Order }, optional: true, nullable: false
        end
      end
    end
  end
end
