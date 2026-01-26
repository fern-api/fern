# frozen_string_literal: true

module FernPagination
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersPaginationResponse < Internal::Types::Model
          field :has_next_page, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "hasNextPage"
          field :page, -> { FernPagination::InlineUsers::InlineUsers::Types::Page }, optional: true, nullable: false
          field :total_count, -> { Integer }, optional: false, nullable: false
          field :data, -> { FernPagination::InlineUsers::InlineUsers::Types::Users }, optional: false, nullable: false
        end
      end
    end
  end
end
