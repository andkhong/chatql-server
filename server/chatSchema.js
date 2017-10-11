import { makeExecutableSchema } from 'graphql-tools';
import { PubSub } from 'graphql-subscriptions';

const pubSub = new PubSub();

const typeDefs = `
    type Message {
        id: ID!
        createdAt: String
        message: String
    }
    type Query {
        allMessages: [Message]
    }
    type Mutation {
        createMessage(message: String!): [Message]
    }
    type Subscription {
        Message(filter: MessageSubscriptionFilter): MessageSubscriptionPayload
      }
      
    input MessageSubscriptionFilter {
        mutation_in: [_ModelMutationType!]
    }
    
    type MessageSubscriptionPayload {
        mutation: _ModelMutationType!
        node: Message
    }

    enum _ModelMutationType {
        CREATED
        UPDATED
        DELETED
    }
`;

const resolvers = {
    Query: {
        allMessages: () => messages
    },
    Mutation: {
        createMessage: (_, data) => {
            const newMessage = Object.assign({
                id: messages.length + 1,
                createdAt: new Date().toLocaleTimeString(),
            }, data);
            messages.push(newMessage);
            pubSub.publish('Message', {
                Message: {
                    mutation: 'CREATED', 
                    node: newMessage
                }
            });
            return messages;
        }
    },
    Subscription: {
        Message: {
            subscribe: () => pubSub.asyncIterator('Message')
        }
    }
};

const messages = [
    {
        id: 1,
        createdAt: new Date().toLocaleTimeString(),
        message: "Default"
    }
];

export const chatSchema = makeExecutableSchema({ typeDefs, resolvers });