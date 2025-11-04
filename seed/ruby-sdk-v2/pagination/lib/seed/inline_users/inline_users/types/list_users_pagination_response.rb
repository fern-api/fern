# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersPaginationResponse < Internal::Types::Model
          field :has_next_page, lambda {
            Internal::Types::Boolean
          }, optional: true, nullable: false, api_name: "hasNextPage"
          field :page, -> { Seed::InlineUsers::InlineUsers::Types::Page }, optional: true, nullable: false
          field :total_count, -> { Integer }, optional: false, nullable: false
          field :data, -> { Seed::InlineUsers::InlineUsers::Types::Users }, optional: false, nullable: false
        end
      end
    end
  end
end
