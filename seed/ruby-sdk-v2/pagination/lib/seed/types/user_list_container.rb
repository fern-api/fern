# frozen_string_literal: true

module Seed
  module Types
    class UserListContainer < Internal::Types::Model
      field :users, -> { Internal::Types::Array[Seed::Types::User] }, optional: false, nullable: false
    end
  end
end
