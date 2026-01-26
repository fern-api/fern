# frozen_string_literal: true

module FernQueryParametersOpenapi
  module Types
    class NestedUser < Internal::Types::Model
      field :name, -> { String }, optional: true, nullable: false
      field :user, -> { FernQueryParametersOpenapi::Types::User }, optional: true, nullable: false
    end
  end
end
