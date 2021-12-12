var express = require('express');
var cors = require('cors');
var {ApolloServer, gql} = require('apollo-server-express');
var myJsonData = require('./mock-data.json');

let typeDefs = gql`
    type TaskList {
        id: String!,
        taskName: String!,
        date: String!,
        taskDetails: [String]!
    }

    type Query {
        hello: String!
        getTaskList: [TaskList]!
        getTaskListDetails(id: Int!): [TaskList]!
    }
`;

let resolvers = {
    Query: {
        hello: () => 'this is hello world',
        getTaskList: () => {
            let todaysDate = new Date();
            let year = todaysDate.getFullYear(),
                month = todaysDate.getMonth(),
                date = todaysDate.getDate();
            todaysDate = new Date(year, month, date);

            let response = myJsonData.filter((item) => {
                let responseDate = new Date(item.date+" 00:00:00");
                return (responseDate.getTime() <= todaysDate.getTime());
            });
            return response.sort((a,b) => b.id-a.id);
        },
        getTaskListDetails: (parent, args) => {
            return myJsonData.filter((item) => {
                return (item.id == args.id)
             })
        }
    }
};

async function startApolloServer(typeDefs, resolvers) {
    const server = new ApolloServer({
        typeDefs,
        resolvers
    });
    const app = express();
    app.use(cors());
    await server.start();
    server.applyMiddleware({ app });
    app.listen(4100, () => {
        console.log(`server starts at ${server.graphqlPath}`);
    })
}

startApolloServer(typeDefs, resolvers);