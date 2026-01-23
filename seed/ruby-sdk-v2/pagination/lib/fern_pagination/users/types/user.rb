# frozen_string_literal: true

module FernPagination
  module Users
    module Types
      class User < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
        field :id, -> { Integer }, optional: false, nullable: false
      end
    end
  end
end
