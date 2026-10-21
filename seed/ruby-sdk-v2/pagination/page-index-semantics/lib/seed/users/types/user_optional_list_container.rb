# frozen_string_literal: true

require_relative "../.."

module Seed
  module Users
    module Types
      class UserOptionalListContainer < Internal::Types::Model
        field :users, -> { Internal::Types::Array[Seed::Users::Types::User] }, optional: true, nullable: false
      end
    end
  end
end
