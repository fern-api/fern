# frozen_string_literal: true

module Seed
  module Types
    class InlineUsersUserOptionalListContainer < Internal::Types::Model
      field :users, -> { Internal::Types::Array[Seed::Types::InlineUsersUser] }, optional: true, nullable: false
    end
  end
end
