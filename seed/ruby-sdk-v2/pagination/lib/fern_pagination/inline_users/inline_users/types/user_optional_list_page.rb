# frozen_string_literal: true

module FernPagination
  module InlineUsers
    module InlineUsers
      module Types
        class UserOptionalListPage < Internal::Types::Model
          field :data, -> { FernPagination::InlineUsers::InlineUsers::Types::UserOptionalListContainer }, optional: false, nullable: false
          field :next_, -> { String }, optional: true, nullable: false, api_name: "next"
        end
      end
    end
  end
end
