# frozen_string_literal: true

module Seed
  module Types
    module Types
      class Resource < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :name, -> { String }, optional: false, nullable: false
        field :description, -> { String }, optional: true, nullable: false
        field :created_at, -> { String }, optional: false, nullable: false
        field :updated_at, -> { String }, optional: false, nullable: false
        field :metadata, lambda {
          Internal::Types::Hash[String, Internal::Types::Hash[String, Object]]
        }, optional: true, nullable: false
      end
    end
  end
end
