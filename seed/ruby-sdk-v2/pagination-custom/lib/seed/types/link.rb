# frozen_string_literal: true

module Seed
  module Types
    class Link < Internal::Types::Model
      field :rel, -> { String }, optional: false, nullable: false

      field :method_, -> { String }, optional: false, nullable: false, api_name: "method"

      field :href, -> { String }, optional: false, nullable: false
    end
  end
end
