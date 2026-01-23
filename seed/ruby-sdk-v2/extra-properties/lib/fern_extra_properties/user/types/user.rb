# frozen_string_literal: true

module FernExtraProperties
  module User
    module Types
      class User < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false
      end
    end
  end
end
