// Standard Node/Express dependencies
import express from 'express';
import bodyParser from 'body-parser';
import { createServer } from 'http';

// GraphQL Dependencies
import { execute, subscribe } from 'graphql';
import { graphqlExpress, graphiqlExpress } from 'apollo-server-express';
import { SubscriptionServer } from 'subscriptions-transport-ws';

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/users', () => console.log("Yarp"));

import { chatSchema } from './chatSchema.js';
app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: chatSchema }));
app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
}));

const server = createServer(app);
server.listen(PORT, () => {
    SubscriptionServer.create({
        execute,
        subscribe,
        schema: chatSchema,
    }, { server: server, path: '/subscriptions' });
    console.log(`App is listening to port ${PORT}`);
});