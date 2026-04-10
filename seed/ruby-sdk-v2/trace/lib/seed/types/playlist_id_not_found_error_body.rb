# frozen_string_literal: true

module Seed
  module Types
    class PlaylistIDNotFoundErrorBody < Internal::Types::Model
      field :type, -> { Seed::Types::PlaylistIDNotFoundErrorBodyType }, optional: false, nullable: false
      field :value, -> { String }, optional: true, nullable: false
    end
  end
end
