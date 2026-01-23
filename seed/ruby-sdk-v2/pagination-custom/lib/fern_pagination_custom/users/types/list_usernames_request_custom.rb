# frozen_string_literal: true

module FernPaginationCustom
  module Users
    module Types
      class ListUsernamesRequestCustom < Internal::Types::Model
        field :starting_after, -> { String }, optional: true, nullable: false
      end
    end
  end
end
