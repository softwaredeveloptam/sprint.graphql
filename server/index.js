const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

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
    getPokemonByAttack(name: String!): [Pokemon]
    Attacks: Attacks
    AttackByType(type: String): [AttackObj]
    Types: [String]  
  }

  input PokemonInput {
    name: String
    classification: String
  }

  input AttackInput {
    name: String
    type: String
    damage: Int
  }
  
  type NewPokemon {
    id: String
    name: String
    classification: String
  }

  input newType {
    name: String
  }
  
  type Mutation {
    createPokemon(input: PokemonInput): NewPokemon
    updatePokemon(id: String, input: PokemonInput): NewPokemon
    deletePokemon(id: String): String
    createAttack(input: AttackInput, category: String): AttackObj
    updateAttack(input: AttackInput, category: String, nameID: String): AttackObj
    deleteAttack(category: String, nameID: String): String
    createType(input: newType): String
    updateType(input: newType, nameID: String): String
    deleteType(input: String): String
  }

`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  deleteType: (response) => {
    index = data.types.indexOf(response.input);
    delete data.types[index];
    return data.types;
  },

  updateType: (response) => {
    index = data.types.indexOf(response.nameID);
    data.types[index] = response.input.name;
    return data.types;
  },

  createType: (response) => {
    data.types.push(response.input.name);
    return data.types;
  },

  deleteAttack: (response) => {
    delete data.attacks[response.category].filter(
      (item) => item.name === response.nameID
    );
    return data.attacks;
  },

  updateAttack: (response) => {
    let found = data.attacks[response.category].filter(
      (item) => item.name === response.nameID
    );
    // console.log(found, "<------ found original attack");
    // console.log("found[0]===>", found[0]);
    found[0].name = response.input.name;
    found[0].type = response.input.type;
    found[0].damage = response.input.damage;
    // console.log(found, "<----- found new attack");
    // console.log(data.attacks.fast[0], "<----- found should change old object");
    return data.attacks;
  },

  createAttack: (response) => {
    let newAttack = {
      name: response.input.name,
      type: response.input.type,
      damage: response.input.damage,
    };
    data.attacks[response.category].push(newAttack);
    return data.attacks;
  },

  createPokemon: (response) => {
    let newSinglePokemon = {
      name: response.input.name,
      classification: response.input.classification,
    };
    data.pokemon.push(newSinglePokemon);
    return data.pokemon;
  },

  updatePokemon: (response) => {
    index = data.pokemon.findIndex((pokemon) => pokemon.id === response.id);
    data.pokemon[index].name = response.input.name;
    return data.pokemon;
  },

  deletePokemon: (response) => {
    // takes an id and deletes the pokemon in the array of objects
    index = data.pokemon.findIndex((pokemon) => pokemon.id === response.id);
    delete data.pokemon[index];
    return data.pokemon;
  },

  Attacks: () => {
    return data.attacks;
  },

  AttackByType: (req) => {
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

  getPokemonByAttack: (request) => {
    let pokemonWithAttack = [];

    if (request.name) {
      for (let i = 0; i < data.pokemon.length; i++) {
        for (let key in data.pokemon[i].attacks) {
          for (let x = 0; x < data.pokemon[i].attacks[key].length; x++) {
            if (data.pokemon[i].attacks[key][x].name === request.name) {
              pokemonWithAttack.push(data.pokemon[i]);
            }
          }
        }
      }
    }

    return pokemonWithAttack;

    /*
    let getPokemonByAttackArray = data.pokemon.filter((singlePokemon) => {
      
      singleAttack = singlePokemon.attacks.fast.

    });

    return getPokemonByAttackArray;
    */
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
