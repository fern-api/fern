# frozen_string_literal: true

module Seed
  module Users
    module Types
      class UserPage < Internal::Types::Model
        field :data, -> { Seed::Users::Types::UserListContainer }, optional: false, nullable: false
        field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
      end
    end
  end
end
