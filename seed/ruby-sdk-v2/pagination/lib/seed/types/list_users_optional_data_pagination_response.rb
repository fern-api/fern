# frozen_string_literal: true

module Seed
  module Types
    class ListUsersOptionalDataPaginationResponse < Internal::Types::Model
      field :has_next_page, -> { Internal::Types::Boolean }, optional: true, nullable: false, api_name: "hasNextPage"
      field :page, -> { Seed::Types::Page }, optional: true, nullable: false
      field :total_count, -> { Integer }, optional: false, nullable: false
      field :data, -> { Internal::Types::Array[Seed::Types::User] }, optional: true, nullable: false
    end
  end
end
