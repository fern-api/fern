# frozen_string_literal: true

module FernMixedFileDirectory
  module User
    module Types
      class ListUsersRequest < Internal::Types::Model
        field :limit, -> { Integer }, optional: true, nullable: false
      end
    end
  end
end
