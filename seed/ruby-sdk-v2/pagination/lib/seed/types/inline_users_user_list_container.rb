# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersUserListContainer < Internal::Types::Model
      field :users, -> { Internal::Types::Array[Seed::Types::InlineUsersUser] }, optional: false, nullable: false
    end
  end
end
