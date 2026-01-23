# frozen_string_literal: true

module FernPagination
  module InlineUsers
    module InlineUsers
      module Types
        class Users < Internal::Types::Model
          field :users, -> { Internal::Types::Array[FernPagination::InlineUsers::InlineUsers::Types::User] }, optional: false, nullable: false
        end
      end
    end
  end
end
