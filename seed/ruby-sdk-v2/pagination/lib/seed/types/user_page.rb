# frozen_string_literal: true

module Seed
  module Types
    class UserPage < Internal::Types::Model
      field :data, -> { Seed::Types::UserListContainer }, optional: false, nullable: false
      field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
    end
  end
end
