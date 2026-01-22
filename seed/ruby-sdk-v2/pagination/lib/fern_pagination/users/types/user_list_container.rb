# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class UserListContainer < Internal::Types::Model
        field :users, -> { Internal::Types::Array[FernPagination::Users::Types::User] }, optional: false, nullable: false
      end
    end
  end
end
