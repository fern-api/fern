# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class UserListContainer < Internal::Types::Model
          field :users, lambda {
            Internal::Types::Array[Seed::InlineUsers::InlineUsers::Types::User]
          }, optional: false, nullable: false
        end
      end
    end
  end
end
