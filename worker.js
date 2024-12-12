import fs from 'fs';
import Queue from 'bull';
import { ObjectId } from 'mongodb';
import imageThumbnail from 'image-thumbnail';
import dbClient from './utils/db';

const fileQueue = new Queue('fileQueue');

fileQueue.process(async (job) => {
  if (!job.data.userId) {
    throw new Error('Missing userId');
  }
  if (!job.data.fileId) {
    throw new Error('Missing fileId');
  }

  const file = await dbClient.filesCollection.findOne(
    { _id: new ObjectId(job.data.fileId) },
    { userId: new ObjectId(job.data.userId) },
  );

  if (!file) {
    throw new Error('File not found');
  }
  try {
    const thumbnail100 = await imageThumbnail(file.localPath, { width: 100 });
    await fs.promises.writeFile(`${file.localPath}_100`, thumbnail100);
    const thumbnail250 = await imageThumbnail(file.localPath, { width: 250 });
    await fs.promises.writeFile(`${file.localPath}_250`, thumbnail250);
    const thumbnail500 = await imageThumbnail(file.localPath, { width: 500 });
    await fs.promises.writeFile(`${file.localPath}_500`, thumbnail500);
  } catch (err) {
    console.error(err);
  }
});

const userQueue = new Queue('userQueue');

userQueue.process(async (job) => {
  if (!job.data.userId) {
    throw new Error('Missing userId');
  }

  const user = await dbClient.usersCollection.findOne(
    { _id: new ObjectId(job.data.userId) },
  );

  if (!user) {
    throw new Error('User not found');
  }
  console.log(`Welcome ${user.email}`);
