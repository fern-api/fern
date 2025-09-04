# frozen_string_literal: true

module Seed
  module NullableOptional
    module Types
      class Document < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false
        field :title, -> { String }, optional: false, nullable: false
        field :content, -> { String }, optional: false, nullable: false
        field :author, -> { String }, optional: false, nullable: true
        field :tags, -> { Internal::Types::Array[String] }, optional: true, nullable: false
      end
    end
  end
end
