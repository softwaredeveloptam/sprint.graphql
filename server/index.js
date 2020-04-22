const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

/*
  check later list
  1. how to populate name when calling evolutions by itself
    // ie:    evolutions: [{ id: Int
    //                       name: String},
    //                     { id: Int
    //                       name: String}]
*/

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String!
    classification: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: Weight
    height: Height
    fleeRate: Float
    evolutionRequirements: EvolutionRequirements
    evolutions: [Evolutions]
    maxCP: Int
    maxHP: Int
    attacks: Attacks

  }

  type Weight {
    minimum: String
    maximum: String
  }

  type Height {
    minimum: String
    maximum: String
  }

  type EvolutionRequirements {
    amount: Int
    name: String
  }

  type Evolutions {
    id: Int
    name: String
  }

  type AttackObj {
    name: String
    type: String
    damage: Int
  }
  
  type Attacks {
    fast: [AttackObj]
    special: [AttackObj]
  }

  type Query {
    Pokemons: [Pokemon]
    getPokemonByName(name: String!): Pokemon
    getPokemonById(id: String!): Pokemon
    getPokemonByType(type: String!): [Pokemon]
    Attacks: Attacks
    AttackByType(type: String): [AttackObj]
    Types: [String]
  }
`);

/*

query {
  type(name: "Dragon") {
    Pokemon {
      name
      id
    }
  }
}

*/

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Attacks: () => {
    return data.attacks;
  },

  AttackByType: (req) => {
    // console.log(req, req.type, typeof(req), "*******")
    // console.log(data.attacks[req.type]);
    return data.attacks[req.type];
  },

  Types: () => {
    return data.types; // data.types or data.types.types
  },

  Pokemons: () => {
    return data.pokemon;
  },

  getPokemonByType: (request) => {
    let getPokemonByTypeArray = data.pokemon.filter((singlePokemon) => {
      if (singlePokemon.types.includes(request.type)) {
        return singlePokemon;
      }
    });

    return getPokemonByTypeArray;
  },

  getPokemonByName: (request) => {
    return data.pokemon.find((pokemon) => pokemon.name === request.name);
  },

  getPokemonById: (request) => {
    return data.pokemon.find((pokemon) => pokemon.id === request.id);
  },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
