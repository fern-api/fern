# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersListUsersMixedTypePaginationResponse < Internal::Types::Model
      field :next_, -> { String }, optional: false, nullable: false, api_name: "next"
      field :data, -> { Seed::Types::InlineUsersUsers }, optional: false, nullable: false
    end
  end
end
