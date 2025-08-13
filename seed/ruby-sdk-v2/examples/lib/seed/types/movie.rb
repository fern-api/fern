
module Seed
    module Types
        class Movie < Internal::Types::Model
            field :id, String, optional: false, nullable: false
            field :prequel, String, optional: true, nullable: false
            field :title, String, optional: false, nullable: false
            field :from, String, optional: false, nullable: false
            field :rating, Integer, optional: false, nullable: false
            field :type, String, optional: false, nullable: false
            field :tag, String, optional: false, nullable: false
            field :book, String, optional: true, nullable: false
            field :metadata, Internal::Types::Hash[String, Internal::Types::Hash[String, ]], optional: false, nullable: false
            field :revenue, Integer, optional: false, nullable: false

    end
end
