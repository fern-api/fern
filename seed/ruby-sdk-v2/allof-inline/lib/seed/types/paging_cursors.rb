# frozen_string_literal: true

require_relative "../../seed"

module Seed
  module Types
    class PagingCursors < Internal::Types::Model
      field :next_, -> { String }, optional: false, nullable: false, api_name: "next"

      field :previous, -> { String }, optional: true, nullable: false
    end
  end
end
