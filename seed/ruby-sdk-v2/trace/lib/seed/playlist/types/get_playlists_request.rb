# frozen_string_literal: true

module Seed
  module Playlist
    module Types
      class GetPlaylistsRequest < Internal::Types::Model
        field :service_param, -> { Integer }, optional: false, nullable: false
        field :limit, -> { Integer }, optional: true, nullable: false
        field :other_field, -> { String }, optional: false, nullable: false
        field :multi_line_docs, -> { String }, optional: false, nullable: false
        field :optional_multiple_field, -> { String }, optional: true, nullable: false
        field :multiple_field, -> { String }, optional: false, nullable: false
      end
    end
  end
end
