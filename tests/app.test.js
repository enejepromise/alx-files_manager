import {
  expect, use, should, request,
} from 'chai';
import chaiHttp from 'chai-http';
import app from '../server';
import dbClient from '../utils/db';

use(chaiHttp);
should();

describe('get status', () => {
  it('return status 200, and status true for redis and mongodb', async () => {
    const res = await request(app).get('/status').send();
    const body = JSON.parse(res.text);
    expect(body).to.eql({ redis: true, db: true });
    expect(res.statusCode).to.equal(200);
  });
});

describe('gET /stats', () => {
  before(async () => {
    await dbClient.connect();
    await dbClient.usersCollection.deleteMany({});
    await dbClient.filesCollection.deleteMany({});
  });
  it('returns number of users and files in db 0 for this one', async () => {
    const response = await request(app).get('/stats').send();
    const body = JSON.parse(response.text);

    expect(body).to.eql({users: 0, files: 0});
    expect(response.statusCode).to.equal(200);
  });

  it('returns number of users and files in db 1 and 2 for this one', async () => {
    await dbClient.usersCollection.insertOne({name: 'Konan'});
    await dbClient.filesCollection.insertOne({name: 'elonmusk.png'});
    await dbClient.filesCollection.insertOne({name: 'whomai.txt'});

    const response = await request(app).get('/stats').send();
    const body = JSON.parse(response.text);

    expect(body).to.eql({users: 1, files: 2});
    expect(response.statusCode).to.equal(200);

  });
