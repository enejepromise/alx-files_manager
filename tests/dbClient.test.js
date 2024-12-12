import { expect, use, should } from 'chai';
import chaiHttp from 'chai-http';
import dbClient from '../utils/db';

use(chaiHttp);
should();

describe('db client', () => {
  before(async () => {
    await dbClient.connect();
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });

  after(async () => {
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });

  it('does the connection is alive', async () => {
    expect(dbClient.isAlive()).to.equal(true);
  });

  it('number of user documents', async () => {
    await dbClient.usersCollection.deleteMany({});
    expect(await dbClient.nbUsers()).to.equal(0);

    await dbClient.usersCollection.insertOne({ name: 'Micheal Scott' });
    await dbClient.usersCollection.insertOne({ name: 'Sawyer' });
    expect(await dbClient.nbUsers()).to.equal(2);
  });

  it('number of file documents', async () => {
    await dbClient.filesCollection.deleteMany({});
    expect(await dbClient.nbFiles()).to.equal(0);

    await dbClient.filesCollection.insertOne({ name: 'kateFile' });
    await dbClient.filesCollection.insertOne({ name: 'ClaireFile' });
    expect(await dbClient.nbUsers()).to.equal(2);
  });
