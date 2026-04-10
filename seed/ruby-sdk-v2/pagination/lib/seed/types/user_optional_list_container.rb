# frozen_string_literal: true

module Seed
  module Types
    class UserOptionalListContainer < Internal::Types::Model
      field :users, -> { Internal::Types::Array[Seed::Types::User] }, optional: true, nullable: false
    end
  end
end
