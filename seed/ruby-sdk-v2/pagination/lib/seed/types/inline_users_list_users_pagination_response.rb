# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersListUsersPaginationResponse < Internal::Types::Model
      field :has_next_page, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "hasNextPage"
      field :page, -> { Seed::Types::InlineUsersPage }, optional: true, nullable: false
      field :total_count, -> { Integer }, optional: false, nullable: false
      field :data, -> { Seed::Types::InlineUsersUsers }, optional: false, nullable: false
    end
  end
end
