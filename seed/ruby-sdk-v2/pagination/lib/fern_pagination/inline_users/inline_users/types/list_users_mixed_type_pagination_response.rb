# frozen_string_literal: true

module FernPagination
  module InlineUsers
    module InlineUsers
      module Types
        class ListUsersMixedTypePaginationResponse < Internal::Types::Model
          field :next_, -> { String }, optional: false, nullable: false, api_name: "next"
          field :data, -> { FernPagination::InlineUsers::InlineUsers::Types::Users }, optional: false, nullable: false
        end
      end
    end
  end
end
