# frozen_string_literal: true

require_relative "../../../../seed"

module Seed
  module InlineUsers
    module InlineUsers
      module Types
        class UserOptionalListPage < Internal::Types::Model
          field :data, -> { Seed::InlineUsers::InlineUsers::Types::UserOptionalListContainer }, optional: false, nullable: false

          field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
        end
      end
    end
  end
end
