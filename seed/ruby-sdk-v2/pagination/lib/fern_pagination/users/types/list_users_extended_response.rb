# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class ListUsersExtendedResponse < Internal::Types::Model
        field :total_count, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
