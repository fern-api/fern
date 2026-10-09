# frozen_string_literal: true

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersExtendedResponse < Internal::Types::Model
          field :data, -> { Seed::InlineUsers::InlineUsers::Types::UserListContainer }, optional: false, nullable: false

          field :next_, -> { String }, optional: true, nullable: false, api_name: "next"

          field :total_count, -> { Integer }, optional: false, nullable: false
        end
      end
    end
  end
end
