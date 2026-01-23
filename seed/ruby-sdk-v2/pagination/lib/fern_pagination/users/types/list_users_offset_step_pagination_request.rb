# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersOffsetStepPaginationRequest < Internal::Types::Model
        field :page, -> { Integer }, optional: true, nullable: false
        field :limit, -> { Integer }, optional: true, nullable: false
        field :order, -> { FernPagination::Users::Types::Order }, optional: true, nullable: false
      end
    end
  end
end
