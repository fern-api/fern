# frozen_string_literal: true

module Seed
  module Types
    module Types
      class ExtendedMovie < Internal::Types::Model
        field :id, -> { String }, optional: false, nullable: false

        field :prequel, -> { String }, optional: true, nullable: false

        field :title, -> { String }, optional: false, nullable: false

        field :from, -> { String }, optional: false, nullable: false

        field :rating, -> { Integer }, optional: false, nullable: false

        field :type, -> { String }, optional: false, nullable: false

        field :tag, -> { String }, optional: false, nullable: false

        field :book, -> { String }, optional: true, nullable: false

        field :metadata, -> { Internal::Types::Hash[String, Object] }, optional: false, nullable: false

        field :revenue, -> { Integer }, optional: false, nullable: false

        field :cast, -> { Internal::Types::Array[String] }, optional: false, nullable: false
      end
    end
  end
end
