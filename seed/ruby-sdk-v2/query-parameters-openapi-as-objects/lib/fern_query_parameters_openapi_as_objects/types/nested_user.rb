# frozen_string_literal: true

module FernQueryParametersOpenapiAsObjects
  module Types
    class NestedUser < Internal::Types::Model
      field :name, -> { String }, optional: true, nullable: false
      field :user, -> { FernQueryParametersOpenapiAsObjects::Types::User }, optional: true, nullable: false
    end
  end
end
