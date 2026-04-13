# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersPage < Internal::Types::Model
      field :page, -> { Integer }, optional: false, nullable: false
      field :next_, -> { Seed::Types::InlineUsersNextPage }, optional: true, nullable: false, api_name: "next"
      field :per_page, -> { Integer }, optional: false, nullable: false
      field :total_page, -> { Integer }, optional: false, nullable: false
    end
  end
end
