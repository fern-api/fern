# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersUserOptionalListPage < Internal::Types::Model
      field :data, -> { Seed::Types::InlineUsersUserOptionalListContainer }, optional: false, nullable: false
      field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
    end
  end
end
