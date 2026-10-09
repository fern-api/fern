# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class Playlist < Internal::Types::Model
        field :name, -> { String }, optional: false, nullable: false

        field :problems, -> { Internal::Types::Array[String] }, optional: false, nullable: false

        field :playlist_id, -> { String }, optional: false, nullable: false

        field :owner_id, -> { String }, optional: false, nullable: false, api_name: "owner-id"
      end
    end
  end
end
