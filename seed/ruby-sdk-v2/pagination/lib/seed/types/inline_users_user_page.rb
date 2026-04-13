# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersUserPage < Internal::Types::Model
      field :data, -> { Seed::Types::InlineUsersUserListContainer }, optional: false, nullable: false
      field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
    end
  end
end
